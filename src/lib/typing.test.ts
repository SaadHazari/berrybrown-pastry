import { describe, expect, it } from 'vitest';
import { typedCounts, typingEnd } from './typing';

const LINES = ['Made with heart,', 'not haste.'];
const T = { startMs: 750, charMs: 60, lineGapMs: 250 };

describe('typing timing', () => {
  it('shows nothing before the start, then one letter every charMs', () => {
    expect(typedCounts(LINES, 749, T)).toEqual([0, 0]);
    expect(typedCounts(LINES, 750, T)).toEqual([1, 0]);
    expect(typedCounts(LINES, 750 + 5 * 60, T)).toEqual([6, 0]);
  });

  it('finishes line 1, pauses, then types line 2', () => {
    expect(typedCounts(LINES, 750 + 15 * 60, T)).toEqual([16, 0]);
    expect(typedCounts(LINES, 750 + 16 * 60 + 249, T)).toEqual([16, 0]);
    expect(typedCounts(LINES, 750 + 16 * 60 + 250, T)).toEqual([16, 1]);
  });

  it('ends with the last letter and stays complete', () => {
    expect(typingEnd(LINES, T)).toBe(2500);
    expect(typedCounts(LINES, 2499, T)).toEqual([16, 9]);
    expect(typedCounts(LINES, 2500, T)).toEqual([16, 10]);
    expect(typedCounts(LINES, 60_000, T)).toEqual([16, 10]);
  });
});
