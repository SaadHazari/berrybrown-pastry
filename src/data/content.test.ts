import { describe, expect, it } from 'vitest';
import { CONTACT, FAQS, LOG, REVIEWS, cakeNumber, upcomingDeadlines } from './content';
import { ALL_MEDIA } from './media';
import { PRODUCTS, ladderLine } from './products';

describe('content', () => {
  it('keeps the photo budget at twelve slots', () => {
    expect(ALL_MEDIA).toHaveLength(12);
  });

  it('has exactly six cakes on one flat ladder', () => {
    expect(PRODUCTS).toHaveLength(6);
    for (const p of PRODUCTS) expect(ladderLine(p)).toBe('5" 150 · 6" 200 · 8" 280');
  });

  it('numbers cakes with three digits, newest first', () => {
    expect(cakeNumber(41)).toBe('#041');
    expect(LOG[0].n).toBeGreaterThan(LOG[1].n);
  });

  it('hides deadlines that have passed', () => {
    expect(upcomingDeadlines(new Date(2026, 8, 27)).map((d) => d.label)).toEqual(['Diwali boxes close', 'National Day', 'Year-end']);
    expect(upcomingDeadlines(new Date(2026, 9, 21)).map((d) => d.label)).toEqual(['National Day', 'Year-end']);
    expect(upcomingDeadlines(new Date(2026, 11, 1))).toEqual([]);
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
