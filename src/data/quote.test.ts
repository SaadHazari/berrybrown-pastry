import { describe, expect, it } from 'vitest';
import { EMPTY_QUOTE, earliestQuoteDate, validateQuote } from './quote';

const now = new Date(2026, 8, 27, 10);
const keys = (o: object) => Object.keys(o).sort();

describe('quote validation', () => {
  it('asks for everything on an empty gift-box form', () => {
    expect(keys(validateQuote('box', EMPTY_QUOTE, now))).toEqual(['boxSize', 'date', 'logo', 'name', 'qty']);
  });

  it('needs 20 boxes, and 50 with a logo', () => {
    const base = { ...EMPTY_QUOTE, boxSize: '8', logo: 'no' as const, date: '2026-10-05', name: 'Lina' };
    expect(validateQuote('box', { ...base, qty: '19' }, now).qty).toBe('The minimum is 20 boxes');
    expect(validateQuote('box', { ...base, qty: '20' }, now)).toEqual({});
    expect(validateQuote('box', { ...base, logo: 'yes', qty: '30', date: '2026-10-20' }, now).qty).toBe('Your logo needs 50 boxes or more');
  });

  it('reads trimmed whole numbers, thousands separators and Arabic digits', () => {
    const base = { ...EMPTY_QUOTE, boxSize: '6', logo: 'no' as const, date: '2026-10-05', name: 'Lina' };
    expect(validateQuote('box', { ...base, qty: ' 25 ' }, now)).toEqual({});
    expect(validateQuote('box', { ...base, qty: '1,000' }, now)).toEqual({});
    expect(validateQuote('box', { ...base, qty: '٦٠' }, now)).toEqual({});
    expect(validateQuote('box', { ...base, qty: '۶۰' }, now)).toEqual({});
  });

  it('asks for a number when the answer is not one', () => {
    const base = { ...EMPTY_QUOTE, boxSize: '6', logo: 'no' as const, date: '2026-10-05', name: 'Lina' };
    expect(validateQuote('box', { ...base, qty: '20 boxes' }, now).qty).toBe('Type the number of boxes');
    expect(validateQuote('box', { ...base, qty: '25.5' }, now).qty).toBe('Type the number of boxes');
    const w = { ...EMPTY_QUOTE, where: 'venue' as const, qty: 'twelve', date: '2026-10-10', name: 'Mira' };
    expect(validateQuote('workshop', w, now).qty).toBe('Type the number of people');
  });

  it('gives plain boxes 5 days and branded boxes 2 weeks, and refuses typed earlier dates', () => {
    expect(earliestQuoteDate('box', { ...EMPTY_QUOTE, logo: 'no' }, now)).toBe('2026-10-02');
    expect(earliestQuoteDate('box', { ...EMPTY_QUOTE, logo: 'yes' }, now)).toBe('2026-10-11');
    const f = { ...EMPTY_QUOTE, boxSize: '6', logo: 'yes' as const, qty: '60', date: '2026-10-10', name: 'Lina' };
    expect(validateQuote('box', f, now).date).toBe('The earliest date is 11 Oct');
  });

  it('lets a logo order placed on the Diwali deadline (20 Oct) arrive before Diwali (8 Nov)', () => {
    const f = { ...EMPTY_QUOTE, boxSize: '8', logo: 'yes' as const, qty: '60', date: '2026-11-07', name: 'Lina' };
    expect(validateQuote('box', f, new Date(2026, 9, 20, 18))).toEqual({});
  });

  it('needs 12 people and a place for a workshop', () => {
    const f = { ...EMPTY_QUOTE, where: 'venue' as const, qty: '11', date: '2026-10-10', name: 'Mira' };
    expect(validateQuote('workshop', f, now).qty).toBe('The minimum is 12 people');
    expect(validateQuote('workshop', { ...f, qty: '12' }, now)).toEqual({});
    expect(validateQuote('workshop', { ...f, qty: '12', date: '2026-10-01' }, now).date).toBe('The earliest date is 4 Oct');
  });

  it('keeps each event format inside its headcount', () => {
    const f = { ...EMPTY_QUOTE, format: 'table' as const, qty: '30', date: '2026-10-10', area: 'DIFC', name: 'Omar' };
    expect(validateQuote('event', f, now).qty).toBe('The Table is for 40–60 guests');
    expect(validateQuote('event', { ...f, qty: '45' }, now)).toEqual({});
    expect(validateQuote('event', { ...f, format: 'session', qty: '25' }, now).qty).toBe('The decorating session is for 12–20 people');
    expect(keys(validateQuote('event', { ...EMPTY_QUOTE, name: 'O' }, now))).toEqual(['area', 'date', 'format']);
  });
});
