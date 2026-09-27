import { describe, expect, it } from 'vitest';
import { deliveryFee, earliestDate, maxLeadHours, subtotal, unitPrice } from './pricing';

const drip = { productId: 'berry-chocolate-drip', sizeId: '6in', flavourId: 'dark', qty: 1 };
const kunafa = { productId: 'pistachio-kunafa', sizeId: '8in', flavourId: 'classic', qty: 1 };

describe('pricing', () => {
  it('prices from the flat ladder', () => {
    expect(unitPrice(drip)).toBe(200);
    expect(unitPrice({ ...drip, sizeId: '5in' })).toBe(150);
    expect(unitPrice(kunafa)).toBe(280);
  });

  it('throws on unknown product or size', () => {
    expect(() => unitPrice({ ...drip, productId: 'nope' })).toThrow();
    expect(() => unitPrice({ ...drip, sizeId: 'huge' })).toThrow();
  });

  it('throws on unknown flavour', () => {
    expect(() => unitPrice({ ...drip, flavourId: 'bacon' })).toThrow();
  });

  it('sums line totals by quantity', () => {
    expect(subtotal([{ ...drip, qty: 2 }, kunafa])).toBe(200 * 2 + 280);
  });

  it('rejects bad quantities', () => {
    expect(() => subtotal([{ ...drip, qty: 0 }])).toThrow();
    expect(() => subtotal([{ ...drip, qty: 1.5 }])).toThrow();
    expect(() => subtotal([{ ...drip, qty: 21 }])).toThrow();
  });

  it('charges AED 20 below 300, free from 300, never for pickup', () => {
    expect(deliveryFee(280, 'dubai')).toBe(20);
    expect(deliveryFee(300, 'dubai')).toBe(0);
    expect(deliveryFee(100, 'pickup')).toBe(0);
    expect(() => deliveryFee(100, 'mars')).toThrow();
  });

  it('uses the longest lead time in the bag', () => {
    expect(maxLeadHours([])).toBe(24);
    expect(maxLeadHours([drip, kunafa])).toBe(24);
  });

  it('gives the first bakeable day after the lead time', () => {
    const now = new Date(2026, 8, 17, 15, 0); // 17 Sep 2026 15:00 local
    expect(earliestDate([drip], now)).toBe('2026-09-18');
    const late = new Date(2026, 8, 17, 21, 30);
    expect(earliestDate([drip], late)).toBe('2026-09-19');
  });
});
