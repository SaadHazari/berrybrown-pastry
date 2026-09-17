/**
 * Server-side (Cloudflare Pages Function) validation + Stripe payload building.
 * Pure: no DOM, no fetch — shared with tests.
 */
import { TIME_SLOTS, getZone } from '../data/zones';
import { isValidEmail, isValidPhone, normalisePhone } from './validation';
import type { Customer } from './order';
import { MESSAGE_MAX, deliveryFee, earliestDate, resolveLine, subtotal, type LineInput } from './pricing';

export type ValidOrder = {
  ref: string;
  lines: LineInput[];
  zoneId: string;
  date: string;
  slotId: string;
  customer: Customer;
};

type Result = { ok: true; order: ValidOrder } | { ok: false; error: string };

const DUBAI_OFFSET_MS = 4 * 3_600_000;
const REF = /^BB-\d{6}-[A-Z0-9]{4}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function parseCheckoutRequest(body: unknown, now: Date = new Date()): Result {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request' };
  const b = body as Record<string, unknown>;

  const ref = str(b.ref, 20);
  if (!REF.test(ref)) return { ok: false, error: 'Invalid order reference' };

  if (!Array.isArray(b.lines) || b.lines.length === 0 || b.lines.length > 30) return { ok: false, error: 'Your bag is empty' };
  const lines: LineInput[] = [];
  for (const raw of b.lines as Record<string, unknown>[]) {
    const message = typeof raw?.message === 'string' ? raw.message.trim() : '';
    if (message.length > MESSAGE_MAX) return { ok: false, error: 'Plaque message is too long' };
    const line: LineInput = {
      productId: str(raw?.productId, 60),
      sizeId: str(raw?.sizeId, 60),
      flavourId: str(raw?.flavourId, 60),
      qty: Number(raw?.qty),
      message: message || undefined,
    };
    try {
      resolveLine(line);
    } catch {
      return { ok: false, error: 'One of the cakes is no longer available' };
    }
    lines.push(line);
  }
  try {
    subtotal(lines); // validates quantities
  } catch {
    return { ok: false, error: 'Invalid quantity' };
  }

  const zoneId = str(b.zoneId, 40);
  const zone = getZone(zoneId);
  if (!zone) return { ok: false, error: 'Unknown delivery area' };

  const slotId = str(b.slotId, 20);
  if (!TIME_SLOTS.some((s) => s.id === slotId)) return { ok: false, error: 'Unknown time slot' };

  const date = str(b.date, 10);
  // Workers run in UTC; shift so getHours()/getDate() read Dubai local time. 1h grace for slow checkouts.
  const dubaiNow = new Date(now.getTime() + DUBAI_OFFSET_MS - 3_600_000);
  if (!DATE.test(date) || date < earliestDate(lines, dubaiNow)) return { ok: false, error: 'That day is too soon for this order' };

  const c = (b.customer ?? {}) as Record<string, unknown>;
  const customer: Customer = {
    name: str(c.name, 80),
    phone: normalisePhone(str(c.phone, 30)),
    email: str(c.email, 120),
    address: str(c.address, 300),
    notes: str(c.notes, 400),
  };
  if (customer.name.length < 2) return { ok: false, error: 'Name is required' };
  if (!isValidPhone(customer.phone)) return { ok: false, error: 'Invalid mobile number' };
  if (!isValidEmail(customer.email)) return { ok: false, error: 'Invalid email' };
  if (!zone.pickup && customer.address.length < 6) return { ok: false, error: 'Address is required' };

  return { ok: true, order: { ref, lines, zoneId, date, slotId, customer } };
}

export function buildStripeForm(order: ValidOrder, origin: string): URLSearchParams {
  const f = new URLSearchParams();
  const zone = getZone(order.zoneId)!;
  const slot = TIME_SLOTS.find((s) => s.id === order.slotId)!;

  f.set('mode', 'payment');
  f.set('locale', 'auto');
  f.set('client_reference_id', order.ref);
  f.set('success_url', `${origin}/?order=success&ref=${order.ref}`);
  f.set('cancel_url', `${origin}/?order=cancelled&ref=${order.ref}`);
  if (order.customer.email) f.set('customer_email', order.customer.email);

  let i = 0;
  for (const l of order.lines) {
    const { product, size, flavour } = resolveLine(l);
    const p = `line_items[${i}]`;
    f.set(`${p}[quantity]`, String(l.qty));
    f.set(`${p}[price_data][currency]`, 'aed');
    f.set(`${p}[price_data][unit_amount]`, String(size.price * 100));
    f.set(`${p}[price_data][product_data][name]`, `${product.name} · ${size.label}`);
    f.set(`${p}[price_data][product_data][description]`, `${flavour.name}${l.message ? ` · Plaque: "${l.message}"` : ''}`);
    f.set(`${p}[price_data][product_data][images][0]`, new URL(product.image, origin).toString());
    i++;
  }

  const fee = deliveryFee(subtotal(order.lines), order.zoneId);
  if (fee > 0) {
    const p = `line_items[${i}]`;
    f.set(`${p}[quantity]`, '1');
    f.set(`${p}[price_data][currency]`, 'aed');
    f.set(`${p}[price_data][unit_amount]`, String(fee * 100));
    f.set(`${p}[price_data][product_data][name]`, `Chilled delivery · ${zone.name}`);
  }

  const messages = order.lines
    .filter((l) => l.message)
    .map((l) => `${resolveLine(l).product.name}: ${l.message}`)
    .join(' | ');

  const meta: Record<string, string> = {
    ref: order.ref,
    fulfilment: zone.pickup ? 'pickup' : `delivery: ${zone.name}`,
    date: order.date,
    slot: slot.label,
    name: order.customer.name,
    phone: order.customer.phone,
    address: order.customer.address,
    notes: order.customer.notes,
    messages,
  };
  for (const [k, v] of Object.entries(meta)) if (v) f.set(`metadata[${k}]`, v.slice(0, 500));
  f.set('payment_intent_data[description]', `Berry Brown order ${order.ref}`);
  for (const [k, v] of Object.entries(meta)) if (v) f.set(`payment_intent_data[metadata][${k}]`, v.slice(0, 500));
  return f;
}
