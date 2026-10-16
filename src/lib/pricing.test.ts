import { describe, expect, it } from 'vitest';
import { deliveryFee, earliestDate, maxLeadHours, subtotal, unitPrice } from './pricing';

const choc = { productId: 'chocolate', sizeId: '6in', flavourId: 'chocolate', qty: 1 };
const straw = { productId: 'strawberry', sizeId: '7in', flavourId: 'strawberry', qty: 1 };

describe('pricing', () => {
  it("prices each cake from its own ladder", () => {
    expect(unitPrice(choc)).toBe(200);
    expect(unitPrice({ ...choc, sizeId: '5in' })).toBe(160);
    expect(unitPrice(straw)).toBe(280);
  });

  it('throws on unknown product or size', () => {
    expect(() => unitPrice({ ...choc, productId: 'nope' })).toThrow();
    expect(() => unitPrice({ ...choc, sizeId: 'huge' })).toThrow();
  });

  it('throws on unknown flavour', () => {
    expect(() => unitPrice({ ...choc, flavourId: 'bacon' })).toThrow();
  });

  it('sums line totals by quantity', () => {
    expect(subtotal([{ ...choc, qty: 2 }, straw])).toBe(200 * 2 + 280);
  });

  it('rejects bad quantities', () => {
    expect(() => subtotal([{ ...choc, qty: 0 }])).toThrow();
    expect(() => subtotal([{ ...choc, qty: 1.5 }])).toThrow();
    expect(() => subtotal([{ ...choc, qty: 21 }])).toThrow();
  });

  it('charges AED 20 below 300, free from 300, never for pickup', () => {
    expect(deliveryFee(280, 'dubai')).toBe(20);
    expect(deliveryFee(300, 'dubai')).toBe(0);
    expect(deliveryFee(100, 'pickup')).toBe(0);
    expect(() => deliveryFee(100, 'mars')).toThrow();
  });

  it('uses the longest lead time in the bag', () => {
    expect(maxLeadHours([])).toBe(24);
    expect(maxLeadHours([choc, straw])).toBe(24);
  });

  it('gives the first bakeable day after the lead time', () => {
    const now = new Date(2026, 8, 17, 15, 0); // 17 Sep 2026 15:00 local
    expect(earliestDate([choc], now)).toBe('2026-09-18');
    const late = new Date(2026, 8, 17, 21, 30);
    expect(earliestDate([choc], late)).toBe('2026-09-19');
  });
});
