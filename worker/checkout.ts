import { buildStripeForm, parseCheckoutRequest, type ValidOrder } from '../src/lib/checkoutRequest';
import { customerRow, orderRow, type OrderChannel } from '../src/lib/orderRow';
import { supabaseFrom, type Supabase, type SupabaseEnv } from './supabase';

/** Every variable is BB_-prefixed so a Dormers key can never be picked up by accident (spec §7). */
export interface Env extends SupabaseEnv {
  ASSETS: Fetcher;
  BB_STRIPE_SECRET_KEY?: string;
  BB_STRIPE_WEBHOOK_SECRET?: string;
  /** Optional card statement suffix, e.g. "BERRY BROWN". Prefix + suffix must fit Stripe's 22 characters. */
  BB_STRIPE_DESCRIPTOR_SUFFIX?: string;
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Same-origin check for browser-originated POSTs. */
export function sameOrigin(request: Request): boolean {
  const origin = new URL(request.url).origin;
  const reqOrigin = request.headers.get('Origin');
  return !reqOrigin || reqOrigin === origin;
}

/**
 * Creates the Berry Brown order (pending) before anything touches Stripe — spec §8.
 * Returns the ids; on a database failure the order id still exists so Stripe metadata is complete.
 */
export async function createPendingOrder(db: Supabase | null, order: ValidOrder, channel: OrderChannel): Promise<{ orderId: string; customerId: string | null; stored: boolean }> {
  const orderId = crypto.randomUUID();
  if (!db) return { orderId, customerId: null, stored: false };
  try {
    const customer = await db.upsert<{ id: string }>('customers', customerRow(order), 'phone');
    const customerId = customer?.id ?? null;
    await db.insert('orders', orderRow(order, channel, orderId, customerId));
    return { orderId, customerId, stored: true };
  } catch (e) {
    console.error('createPendingOrder', String(e));
    return { orderId, customerId: null, stored: false };
  }
}

/** POST /api/checkout — validates the order, re-prices it, records it, creates a Stripe Checkout session. */
export async function handleCheckout(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.BB_STRIPE_SECRET_KEY) return json({ error: 'Online payments are not configured' }, 503);
  if (!sameOrigin(request)) return json({ error: 'Forbidden' }, 403);

  const origin = new URL(request.url).origin;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  const parsed = parseCheckoutRequest(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const db = supabaseFrom(env);
  const { orderId, customerId, stored } = await createPendingOrder(db, parsed.order, 'online');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.BB_STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': parsed.order.ref,
    },
    body: buildStripeForm(parsed.order, origin, { orderId, customerId, descriptorSuffix: env.BB_STRIPE_DESCRIPTOR_SUFFIX }),
  });

  const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!res.ok || !data.url) {
    console.error('Stripe error', res.status, data.error?.message);
    if (db && stored) ctx.waitUntil(db.update('orders', { id: `eq.${orderId}`, status: 'eq.pending' }, { status: 'cancelled' }).catch(() => undefined));
    return json({ error: 'Payment could not be started. Please try again or order on WhatsApp.' }, 502);
  }

  // Link the session without delaying the redirect. The webhook is the only thing that marks it paid.
  if (db && stored && data.id) ctx.waitUntil(db.update('orders', { id: `eq.${orderId}` }, { stripe_checkout_session_id: data.id }).catch((e) => console.error('orders link', String(e))));

  return json({ url: data.url });
}
