import { webhookAction, type StripeEvent } from '../src/lib/stripeEvent';
import { verifyStripeSignature } from '../src/lib/stripeSignature';
import { json, type Env } from './checkout';
import { supabaseFrom, type Supabase } from './supabase';

/**
 * POST /api/stripe/webhook — the only place an order becomes "paid" (spec §8, critical rule).
 * The endpoint lives on the shared Dormers account, so every event is checked for Berry Brown
 * metadata first and Dormers events are acknowledged and ignored.
 * Register in Stripe: checkout.session.completed, .async_payment_succeeded, .async_payment_failed,
 * .expired, and charge.refunded. Put the signing secret in BB_STRIPE_WEBHOOK_SECRET.
 */
export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.BB_STRIPE_WEBHOOK_SECRET) return json({ error: 'Webhook is not configured' }, 503);

  const payload = await request.text();
  if (!(await verifyStripeSignature(payload, request.headers.get('Stripe-Signature'), env.BB_STRIPE_WEBHOOK_SECRET))) {
    return json({ error: 'Bad signature' }, 400);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return json({ error: 'Invalid payload' }, 400);
  }

  const action = webhookAction(event);
  if (action.kind === 'ignore') return json({ received: true, ignored: action.reason });

  const db = supabaseFrom(env);
  if (!db) return json({ error: 'Order log is not set up' }, 503); // Stripe retries until Supabase is configured

  try {
    await apply(db, action);
  } catch (e) {
    console.error('webhook', action.kind, String(e));
    return json({ error: 'Could not update the order' }, 500); // Stripe retries
  }
  return json({ received: true, action: action.kind });
}

type Order = { id: string; ref: string; status: string; total: number };

async function apply(db: Supabase, action: Exclude<ReturnType<typeof webhookAction>, { kind: 'ignore' }>): Promise<void> {
  if (action.kind === 'paid') {
    const [order] = await db.select<Order>('orders', 'id,ref,status,total', { ref: `eq.${action.ref}` }, 1);
    if (!order) {
      console.error('webhook: no order for', action.ref);
      return;
    }
    const paidAt = new Date().toISOString();
    await db.update('orders', { id: `eq.${order.id}` }, { status: 'paid', paid_at: paidAt, stripe_checkout_session_id: action.sessionId, stripe_payment_intent_id: action.paymentIntentId });
    // Idempotent on the Stripe event id — a retried webhook never double-counts.
    await db.upsert('payments', { order_id: order.id, provider: 'stripe', provider_payment_id: action.paymentIntentId ?? action.sessionId ?? action.eventId, status: 'succeeded', amount: action.amount ?? order.total, currency: 'AED', paid_at: paidAt, raw_event_id: action.eventId }, 'raw_event_id', 'ignore');
    return;
  }
  if (action.kind === 'cancel') {
    await db.update('orders', { ref: `eq.${action.ref}`, status: 'eq.pending' }, { status: 'cancelled' });
    return;
  }
  // refund: the second lock is that the PaymentIntent must belong to one of *our* orders.
  const [order] = await db.select<Order>('orders', 'id,ref,status,total', { stripe_payment_intent_id: `eq.${action.paymentIntentId}` }, 1);
  if (!order) {
    console.error('webhook: refund for unknown payment intent', action.paymentIntentId);
    return;
  }
  await db.upsert('payments', { order_id: order.id, provider: 'stripe', provider_payment_id: action.chargeId, status: 'refunded', amount: -action.amountRefunded, currency: 'AED', paid_at: new Date().toISOString(), raw_event_id: action.eventId }, 'raw_event_id', 'ignore');
  if (action.fullyRefunded) await db.update('orders', { id: `eq.${order.id}` }, { status: 'refunded' });
}
