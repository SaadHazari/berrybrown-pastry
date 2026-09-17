import { buildStripeForm, parseCheckoutRequest } from '../../src/lib/checkoutRequest';

interface Env {
  STRIPE_SECRET_KEY?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Online payments are not configured' }, 503);

  const origin = new URL(request.url).origin;
  const reqOrigin = request.headers.get('Origin');
  if (reqOrigin && reqOrigin !== origin) return json({ error: 'Forbidden' }, 403);

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

  const data = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !data.url) {
    console.error('Stripe error', res.status, data.error?.message);
    return json({ error: 'Payment could not be started. Please try again or order on WhatsApp.' }, 502);
  }
  return json({ url: data.url });
};

export const onRequest: PagesFunction<Env> = async () => json({ error: 'Method not allowed' }, 405);
