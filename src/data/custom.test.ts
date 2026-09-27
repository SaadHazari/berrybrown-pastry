import { describe, expect, it } from 'vitest';
import { EMPTY_CUSTOM, FLAVOURS, customFromPrice, customSummary, earliestCustomDate, validateCustom } from './custom';

describe('custom cake form', () => {
  it('offers the Six plus "Something else" as flavours', () => {
    expect(FLAVOURS).toHaveLength(7);
    expect(FLAVOURS.at(-1)?.id).toBe('other');
  });

  it('maps people to a from-price', () => {
    expect(customFromPrice(EMPTY_CUSTOM)).toBe(300);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: 'up-to-6' })).toBe(300);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: '6-8' })).toBe(300);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: '10-14' })).toBe(420);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: 'more' })).toBe(850);
  });

  it('needs 48 hours', () => {
    expect(earliestCustomDate(new Date(2026, 8, 27, 10, 0))).toBe('2026-09-29');
  });

  it('requires every pick, and the text box behind "Something else"', () => {
    expect(Object.keys(validateCustom(EMPTY_CUSTOM, '2026-09-29')).sort()).toEqual(['date', 'flavour', 'look', 'occasion', 'serves']);
    const full = { ...EMPTY_CUSTOM, occasion: 'other', serves: '6-8', look: 'drip', flavour: 'other', date: '2026-09-29' };
    expect(Object.keys(validateCustom(full, '2026-09-29')).sort()).toEqual(['flavourOther', 'occasionOther']);
    expect(validateCustom({ ...full, occasionOther: 'Graduation', flavourOther: 'Lemon' }, '2026-09-29')).toEqual({});
    expect(validateCustom({ ...full, occasionOther: 'G', flavourOther: 'L', date: '2026-09-28' }, '2026-09-29').date).toBeTruthy();
    expect(validateCustom({ ...full, occasionOther: 'G', flavourOther: 'L', words: 'x'.repeat(36) }, '2026-09-29').words).toBeTruthy();
  });

  it('summarises the six answers in order', () => {
    const rows = customSummary({ ...EMPTY_CUSTOM, occasion: 'baby', serves: '10-14', look: 'buttercream', flavour: 'berry-charlotte', words: ' Welcome ', date: '2026-10-01' });
    expect(rows.map((r) => r.label)).toEqual(['Occasion', 'People', 'Look', 'Flavour', 'Words', 'Date']);
    expect(rows.map((r) => r.value)).toEqual(['Baby shower', '10–14 · 8"', 'Soft buttercream', 'Vanilla Berry Charlotte', 'Welcome', '2026-10-01']);
  });
});
