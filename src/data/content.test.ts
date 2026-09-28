import { describe, expect, it } from 'vitest';
import { CONTACT, FAQS, LOG, REVIEWS, cakeNumber } from './content';
import { PRICE_LADDER, PRODUCTS } from './products';

describe('content', () => {
  it('has exactly six cakes on one flat ladder', () => {
    expect(PRODUCTS).toHaveLength(6);
    for (const p of PRODUCTS) expect(p.sizes.map((s) => `${s.label} ${s.price}`)).toEqual(['5" 150', '6" 200', '8" 280']);
    for (const p of PRODUCTS) expect(p.sizes).toBe(PRICE_LADDER);
  });

  it('numbers cakes with three digits, newest first', () => {
    expect(cakeNumber(41)).toBe('#041');
    expect(LOG[0].n).toBeGreaterThan(LOG[1].n);
  });

  it('uses the studio contact details', () => {
    expect(CONTACT.whatsapp).toBe('971547944882');
    expect(CONTACT.phoneDisplay).toBe('+971 54 794 4882');
    expect(CONTACT.email).toBe('connect@berrybrown.me');
  });

  it('speaks as a team in customer-facing copy', () => {
    expect(JSON.stringify({ REVIEWS, FAQS })).not.toMatch(/Safa/);
  });

  it('has no exclamation marks in sample reviews', () => {
    for (const r of REVIEWS) expect(r.text).not.toContain('!');
  });
});
