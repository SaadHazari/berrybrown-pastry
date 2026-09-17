import { describe, expect, it } from 'vitest';
import { DEFAULT_SELECTION, estimate } from './builder';

describe('builder estimate', () => {
  it('adds option prices into a range', () => {
    // birthday 0 + 2 tiers 900 + florals 180 + vanilla 0 = 1080
    expect(estimate(DEFAULT_SELECTION)).toEqual({ min: 1080, max: 1350 });
  });
});
