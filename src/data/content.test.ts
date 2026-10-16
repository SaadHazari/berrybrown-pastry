import { describe, expect, it } from 'vitest';
import { CONTACT, FAQS, LOG, REVIEWS, cakeNumber } from './content';
import { PRODUCTS } from './products';

describe('content', () => {
  it('has the six cakes from the studio price list, each with its own prices', () => {
    expect(PRODUCTS.map((p) => [p.name, p.sizes.map((s) => `${s.label} ${s.price}`).join(' / ')])).toEqual([
      ['Brown Butter & Cinnamon', '5" 145 / 6" 180 / 7" 245'],
      ['Vanilla Raspberry', '5" 145 / 6" 180 / 7" 245'],
      ['Lemon & Cream Cheese', '5" 155 / 6" 195 / 7" 265'],
      ['Classic Chocolate', '5" 160 / 6" 200 / 7" 270'],
      ['Earl Grey & Honey', '5" 155 / 6" 190 / 7" 255'],
      ['Strawberry & Mascarpone', '5" 175 / 6" 210 / 7" 280'],
    ]);
    for (const p of PRODUCTS) expect(p.sample).toBe(false);
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
