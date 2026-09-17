import { describe, expect, it } from 'vitest';
import { deliveryFee, earliestDate, maxLeadHours, subtotal, unitPrice } from './pricing';

const drip = { productId: 'berry-chocolate-drip', sizeId: 'classic', flavourId: 'dark', qty: 1 };
const tiered = { productId: 'celebration-tiered', sizeId: 'two', flavourId: 'vanilla-berry', qty: 1 };

describe('pricing', () => {
  it('prices a known size', () => {
    expect(unitPrice(drip)).toBe(295);
  });

  it('throws on unknown product or size', () => {
    expect(() => unitPrice({ ...drip, productId: 'nope' })).toThrow();
    expect(() => unitPrice({ ...drip, sizeId: 'huge' })).toThrow();
  });

  it('throws on unknown flavour', () => {
    expect(() => unitPrice({ ...drip, flavourId: 'bacon' })).toThrow();
  });

  it('sums line totals by quantity', () => {
    expect(subtotal([{ ...drip, qty: 2 }, tiered])).toBe(295 * 2 + 850);
  });

  it('rejects bad quantities', () => {
    expect(() => subtotal([{ ...drip, qty: 0 }])).toThrow();
    expect(() => subtotal([{ ...drip, qty: 1.5 }])).toThrow();
    expect(() => subtotal([{ ...drip, qty: 21 }])).toThrow();
  });

  it('charges delivery below the free threshold only', () => {
    expect(deliveryFee(295, 'downtown')).toBe(30);
    expect(deliveryFee(500, 'downtown')).toBe(0);
    expect(deliveryFee(100, 'pickup')).toBe(0);
    expect(() => deliveryFee(100, 'mars')).toThrow();
  });

  it('uses the longest lead time in the bag', () => {
    expect(maxLeadHours([])).toBe(24);
    expect(maxLeadHours([drip])).toBe(24);
    expect(maxLeadHours([drip, tiered])).toBe(48);
  });

  it('gives the first bakeable day after the lead time', () => {
    const now = new Date(2026, 8, 17, 15, 0); // 17 Sep 2026 15:00 local
    expect(earliestDate([drip], now)).toBe('2026-09-18');
    expect(earliestDate([tiered], now)).toBe('2026-09-19');
    const late = new Date(2026, 8, 17, 21, 30);
    expect(earliestDate([drip], late)).toBe('2026-09-19');
  });
});
