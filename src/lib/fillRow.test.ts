import { describe, expect, it } from 'vitest';
import { fillRow } from './fillRow';

describe('fillRow', () => {
  it('repeats a short list in whole copies until it reaches the minimum', () => {
    expect(fillRow(['a', 'b'], 8)).toEqual(['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b']);
    expect(fillRow(['a'], 3)).toEqual(['a', 'a', 'a']);
    expect(fillRow([1, 2, 3, 4, 5], 8)).toHaveLength(10);
  });

  it('leaves a long list alone and copes with an empty one', () => {
    expect(fillRow([1, 2, 3, 4, 5, 6, 7, 8, 9], 8)).toHaveLength(9);
    expect(fillRow([], 8)).toEqual([]);
  });
});
