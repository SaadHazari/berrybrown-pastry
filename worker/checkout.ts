import { buildStripeForm, parseCheckoutRequest } from '../src/lib/checkoutRequest';
import { orderRow } from '../src/lib/orderRow';
import { supabaseFrom, type SupabaseEnv } from './supabase';

export interface Env extends SupabaseEnv {
  ASSETS: Fetcher;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
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

/** POST /api/checkout — validates the order, re-prices it, creates a Stripe Checkout session, records the order. */
export async function handleCheckout(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Online payments are not configured' }, 503);
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

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': parsed.order.ref,
    },
    body: buildStripeForm(parsed.order, origin),
  });

  const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!res.ok || !data.url) {
    console.error('Stripe error', res.status, data.error?.message);
    return json({ error: 'Payment could not be started. Please try again or order on WhatsApp.' }, 502);
  }

  // Record the pending order without delaying the redirect. The webhook marks it paid.
  const db = supabaseFrom(env);
  if (db) ctx.waitUntil(db.insert('orders', orderRow(parsed.order, 'online', data.id ?? null)).catch((e) => console.error('orders insert', String(e))));

  return json({ url: data.url });
}
