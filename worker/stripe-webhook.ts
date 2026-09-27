import { verifyStripeSignature } from '../src/lib/stripeSignature';
import { json, type Env } from './checkout';
import { supabaseFrom } from './supabase';

type StripeEvent = {
  id: string;
  type: string;
  data: { object: { id?: string; client_reference_id?: string | null; payment_intent?: string | null } };
};

/**
 * POST /api/stripe/webhook — Stripe tells us a Checkout session was paid (or expired).
 * Register the endpoint in the Stripe dashboard and put its signing secret in STRIPE_WEBHOOK_SECRET.
 */
export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: 'Webhook is not configured' }, 503);

  const payload = await request.text();
  if (!(await verifyStripeSignature(payload, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET))) {
    return json({ error: 'Bad signature' }, 400);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return json({ error: 'Invalid payload' }, 400);
  }

  const db = supabaseFrom(env);
  if (!db) return json({ received: true, stored: false });

  const s = event.data?.object ?? {};
  const ref = s.client_reference_id ?? '';
  if (!/^BB-\d{6}-[A-Z0-9]{4}$/.test(ref)) return json({ received: true });

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await db.update('orders', { ref: `eq.${ref}` }, { status: 'paid', paid_at: new Date().toISOString(), stripe_session_id: s.id ?? null, stripe_payment_intent: s.payment_intent ?? null });
    } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      await db.update('orders', { ref: `eq.${ref}`, status: 'eq.pending' }, { status: 'cancelled' });
    }
  } catch (e) {
    console.error('webhook update', String(e));
    return json({ error: 'Could not update the order' }, 500); // Stripe retries
  }
  return json({ received: true });
}
