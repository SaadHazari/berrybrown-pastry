import { parseCheckoutRequest } from '../src/lib/checkoutRequest';
import { createPendingOrder, json, sameOrigin, type Env } from './checkout';
import { supabaseFrom } from './supabase';

/**
 * POST /api/orders — records a WhatsApp order the moment the customer taps "Order on WhatsApp".
 * Same validation as checkout; the order is stored as pending until Safa confirms it in Supabase.
 */
export async function handleOrders(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!sameOrigin(request)) return json({ error: 'Forbidden' }, 403);
  const db = supabaseFrom(env);
  if (!db) return json({ error: 'Order log is not set up' }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  const parsed = parseCheckoutRequest(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const { orderId, stored } = await createPendingOrder(db, parsed.order, 'whatsapp');
  if (!stored) return json({ error: 'Could not save the order' }, 502);
  return json({ ok: true, orderId }, 201);
}
