import { describe, expect, it } from 'vitest';
import { buildStripeForm, parseCheckoutRequest } from './checkoutRequest';

const now = new Date(Date.UTC(2026, 8, 17, 8, 0)); // 12:00 in Dubai
const valid = {
  ref: 'BB-260917-AB12',
  lines: [{ productId: 'berry-chocolate-drip', sizeId: '6in', flavourId: 'dark', qty: 1, message: 'Hi' }],
  zoneId: 'dubai',
  date: '2026-09-18',
  slotId: 'evening',
  customer: { name: 'Sara', phone: '0501234567', email: 'sara@example.com', address: 'Tower 1, 1204', notes: '' },
};
const ID = '11111111-2222-4333-8444-555555555555';

describe('parseCheckoutRequest', () => {
  it('accepts a valid order', () => {
    const r = parseCheckoutRequest(valid, now);
    expect(r.ok).toBe(true);
  });

  it('rejects tampered or incomplete orders', () => {
    const bad = [
      { ...valid, ref: 'x' },
      { ...valid, lines: [] },
      { ...valid, lines: [{ ...valid.lines[0], sizeId: 'free' }] },
      { ...valid, lines: [{ ...valid.lines[0], qty: -1 }] },
      { ...valid, zoneId: 'moon' },
      { ...valid, zoneId: 'downtown' }, // old zone list is gone
      { ...valid, slotId: 'midnight' },
      { ...valid, date: '2026-09-17' },
      { ...valid, date: 'tomorrow' },
      { ...valid, customer: { ...valid.customer, phone: '123' } },
      { ...valid, customer: { ...valid.customer, address: '' } },
      { ...valid, lines: [{ ...valid.lines[0], message: 'x'.repeat(36) }] },
      null,
      'hello',
    ];
    for (const b of bad) expect(parseCheckoutRequest(b, now).ok, JSON.stringify(b)).toBe(false);
  });

  it('allows pickup without an address', () => {
    const r = parseCheckoutRequest({ ...valid, zoneId: 'pickup', customer: { ...valid.customer, address: '' } }, now);
    expect(r.ok).toBe(true);
  });
});

describe('buildStripeForm', () => {
  const form = () => {
    const r = parseCheckoutRequest(valid, now);
    if (!r.ok) throw new Error(r.error);
    return buildStripeForm(r.order, 'https://berrybrown.me', { orderId: ID, customerId: 'cust-1', descriptorSuffix: 'BERRY BROWN' });
  };

  it('prices from the catalogue and adds delivery', () => {
    const f = form();
    expect(f.get('mode')).toBe('payment');
    expect(f.get('line_items[0][price_data][currency]')).toBe('aed');
    expect(f.get('line_items[0][price_data][unit_amount]')).toBe('20000');
    expect(f.get('line_items[0][price_data][product_data][images][0]')).toBeNull(); // placeholder slots send no image
    expect(f.get('line_items[1][price_data][unit_amount]')).toBe('2000');
    expect(f.get('customer_email')).toBe('sara@example.com');
    expect(f.get('client_reference_id')).toBe('BB-260917-AB12');
    expect(f.get('success_url')).toBe('https://berrybrown.me/?order=success&ref=BB-260917-AB12');
    expect(f.get('cancel_url')).toBe('https://berrybrown.me/?order=cancelled&ref=BB-260917-AB12');
  });

  it('keeps Berry Brown separate from Dormers on the shared Stripe account (spec §4–5)', () => {
    const f = form();
    // Product naming convention
    expect(f.get('line_items[0][price_data][product_data][name]')).toBe('BB | Berry Chocolate Drip | 6"');
    expect(f.get('line_items[1][price_data][product_data][name]')).toBe('BB | Delivery | Dubai');
    expect(f.get('line_items[0][price_data][product_data][metadata][brand]')).toBe('berry_brown');
    // Session metadata namespace
    expect(f.get('metadata[brand]')).toBe('berry_brown');
    expect(f.get('metadata[application]')).toBe('berry_brown_web');
    expect(f.get('metadata[order_id]')).toBe(ID);
    expect(f.get('metadata[order_ref]')).toBe('BB-260917-AB12');
    expect(f.get('metadata[customer_id]')).toBe('cust-1');
    expect(f.get('metadata[phone]')).toBe('0501234567');
    // Mirrored onto the PaymentIntent (so Charges and Refunds carry it)
    expect(f.get('payment_intent_data[metadata][brand]')).toBe('berry_brown');
    expect(f.get('payment_intent_data[metadata][order_id]')).toBe(ID);
    expect(f.get('payment_intent_data[description]')).toBe('Berry Brown order BB-260917-AB12');
    expect(f.get('payment_intent_data[receipt_email]')).toBe('sara@example.com');
    expect(f.get('payment_intent_data[statement_descriptor_suffix]')).toBe('BERRY BROWN');
    // Berry Brown look on the hosted page
    expect(f.get('branding_settings[display_name]')).toBe('Berry Brown');
    expect(f.get('branding_settings[button_color]')).toBe('#7A2A3A');
    expect(f.get('branding_settings[icon][url]')).toBe('https://berrybrown.me/icon-512.png');
  });

  it('sends no suffix or icon when they cannot be valid', () => {
    const r = parseCheckoutRequest(valid, now);
    if (!r.ok) throw new Error(r.error);
    const f = buildStripeForm(r.order, 'http://127.0.0.1:8787', { orderId: ID });
    expect(f.get('payment_intent_data[statement_descriptor_suffix]')).toBeNull();
    expect(f.get('branding_settings[icon][url]')).toBeNull();
    expect(f.get('metadata[customer_id]')).toBeNull();
  });

  it('omits delivery when free (300 and over)', () => {
    const r = parseCheckoutRequest({ ...valid, lines: [{ ...valid.lines[0], qty: 2 }] }, now);
    if (!r.ok) throw new Error(r.error);
    const f = buildStripeForm(r.order, 'https://x.dev', { orderId: ID });
    expect(f.get('line_items[1][price_data][unit_amount]')).toBeNull();
  });
});
