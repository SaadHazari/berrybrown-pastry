import { describe, expect, it } from 'vitest';
import { deadlineLine, isQuoteAbout, nextDeadline, upcomingDeadlines } from './companies';

const day = (m: number, d: number) => new Date(2026, m - 1, d, 12);

describe('gift-box deadlines', () => {
  it('lists every deadline at the end of September', () => {
    expect(upcomingDeadlines(day(9, 27)).map((d) => d.label)).toEqual(['Diwali', 'National Day', 'Year-end']);
  });

  it('keeps Diwali open for plain boxes after the branded date', () => {
    const open = upcomingDeadlines(day(10, 21));
    expect(open.map((d) => d.label)).toEqual(['Diwali', 'National Day', 'Year-end']);
    expect(deadlineLine(open[0], day(10, 21))).toBe('Diwali · 28 Oct plain');
    expect(upcomingDeadlines(day(10, 29)).map((d) => d.label)).toEqual(['National Day', 'Year-end']);
  });

  it('shows both dates while both are open', () => {
    expect(deadlineLine({ label: 'Year-end', branded: '2026-11-27', plain: '2026-12-03' }, day(11, 1))).toBe('Year-end · 27 Nov with your logo, 3 Dec plain');
    expect(deadlineLine({ label: 'National Day', date: '2026-11-10' }, day(11, 1))).toBe('National Day · 10 Nov');
  });

  it('points the strip at the soonest open date, including on the day itself', () => {
    expect(nextDeadline(day(9, 27))).toEqual({ label: 'Diwali', date: '2026-10-20' });
    expect(nextDeadline(day(10, 20))).toEqual({ label: 'Diwali', date: '2026-10-20' });
    expect(nextDeadline(day(10, 21))).toEqual({ label: 'Diwali', date: '2026-10-28' });
    expect(nextDeadline(day(12, 4))).toBeNull();
  });

  it('recognises quote kinds', () => {
    expect(isQuoteAbout('box')).toBe(true);
    expect(isQuoteAbout('event')).toBe(true);
    expect(isQuoteAbout('table')).toBe(false);
    expect(isQuoteAbout(null)).toBe(false);
  });
});
