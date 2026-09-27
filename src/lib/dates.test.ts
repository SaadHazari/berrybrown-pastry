import { describe, expect, it } from 'vitest';
import { addDays, localIso, shortDate } from './dates';

describe('dates', () => {
  it('formats a local ISO date', () => {
    expect(localIso(new Date(2026, 8, 7))).toBe('2026-09-07');
  });

  it('adds calendar days across a month end, ignoring the time of day', () => {
    expect(localIso(addDays(new Date(2026, 8, 27, 23, 30), 7))).toBe('2026-10-04');
  });

  it('shows a short date', () => {
    expect(shortDate('2026-10-20')).toBe('20 Oct');
  });
});
