import { describe, expect, it } from 'vitest';
import { buildStripeForm, parseCheckoutRequest } from './checkoutRequest';

const now = new Date(Date.UTC(2026, 8, 17, 8, 0)); // 12:00 in Dubai
const valid = {
  ref: 'BB-260917-AB12',
  lines: [{ productId: 'berry-chocolate-drip', sizeId: 'classic', flavourId: 'dark', qty: 1, message: 'Hi' }],
  zoneId: 'downtown',
  date: '2026-09-18',
  slotId: 'evening',
  customer: { name: 'Sara', phone: '0501234567', email: 'sara@example.com', address: 'Tower 1, 1204', notes: '' },
};

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
  it('prices from the catalogue and adds delivery', () => {
    const r = parseCheckoutRequest({ ...valid, lines: [{ ...valid.lines[0], qty: 1 }] }, now);
    if (!r.ok) throw new Error(r.error);
    const form = buildStripeForm(r.order, 'https://berrybrown.ae');
    expect(form.get('mode')).toBe('payment');
    expect(form.get('line_items[0][price_data][currency]')).toBe('aed');
    expect(form.get('line_items[0][price_data][unit_amount]')).toBe('29500');
    expect(form.get('line_items[1][price_data][unit_amount]')).toBe('3000');
    expect(form.get('customer_email')).toBe('sara@example.com');
    expect(form.get('client_reference_id')).toBe('BB-260917-AB12');
    expect(form.get('success_url')).toBe('https://berrybrown.ae/?order=success&ref=BB-260917-AB12');
    expect(form.get('cancel_url')).toBe('https://berrybrown.ae/?order=cancelled&ref=BB-260917-AB12');
    expect(form.get('metadata[phone]')).toBe('0501234567');
  });

  it('omits delivery when free', () => {
    const r = parseCheckoutRequest({ ...valid, lines: [{ ...valid.lines[0], qty: 2 }] }, now);
    if (!r.ok) throw new Error(r.error);
    const form = buildStripeForm(r.order, 'https://x.dev');
    expect(form.get('line_items[1][price_data][unit_amount]')).toBeNull();
  });
});
