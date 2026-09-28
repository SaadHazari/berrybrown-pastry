import { describe, expect, it } from 'vitest';
import { PRICE_LADDER, PRODUCTS, sizeFor } from './products';

describe('products', () => {
  const cake = PRODUCTS[0];

  it('gives every size a "serves" range for the tag on the card', () => {
    expect(PRICE_LADDER.map((s) => [s.label, s.serves])).toEqual([
      ['5"', '4–6'],
      ['6"', '6–8'],
      ['8"', '10–14'],
    ]);
  });

  it('uses the chosen size, or the 6" when none is chosen', () => {
    expect(sizeFor(cake, '8in').label).toBe('8"');
    expect(sizeFor(cake, null).label).toBe('6"');
    expect(sizeFor(cake, undefined).label).toBe('6"');
    expect(sizeFor(cake, 'no-such-size').label).toBe('6"');
  });
});
