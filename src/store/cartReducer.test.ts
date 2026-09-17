import { describe, expect, it } from 'vitest';
import { cartReducer, lineKey } from './cartReducer';

const line = { productId: 'berry-chocolate-drip', sizeId: 'classic', flavourId: 'dark', qty: 1 };

describe('cartReducer', () => {
  it('adds a new line with a stable key', () => {
    const s = cartReducer([], { type: 'add', line });
    expect(s).toHaveLength(1);
    expect(s[0].key).toBe(lineKey(line));
  });

  it('merges identical lines and keeps different messages apart', () => {
    let s = cartReducer([], { type: 'add', line });
    s = cartReducer(s, { type: 'add', line: { ...line, qty: 2 } });
    expect(s).toHaveLength(1);
    expect(s[0].qty).toBe(3);
    s = cartReducer(s, { type: 'add', line: { ...line, message: 'Hi' } });
    expect(s).toHaveLength(2);
  });

  it('caps quantity at 20', () => {
    const s = cartReducer([], { type: 'add', line: { ...line, qty: 25 } });
    expect(s[0].qty).toBe(20);
  });

  it('sets qty and removes at zero', () => {
    let s = cartReducer([], { type: 'add', line });
    const key = s[0].key;
    s = cartReducer(s, { type: 'qty', key, qty: 4 });
    expect(s[0].qty).toBe(4);
    s = cartReducer(s, { type: 'qty', key, qty: 0 });
    expect(s).toEqual([]);
  });

  it('removes and clears', () => {
    let s = cartReducer([], { type: 'add', line });
    s = cartReducer(s, { type: 'remove', key: s[0].key });
    expect(s).toEqual([]);
    s = cartReducer(cartReducer([], { type: 'add', line }), { type: 'clear' });
    expect(s).toEqual([]);
  });

  it('drops invalid stored lines on hydrate', () => {
    const s = cartReducer([], {
      type: 'hydrate',
      lines: [{ ...line, key: 'x' }, { ...line, productId: 'gone', key: 'y' }],
    });
    expect(s).toHaveLength(1);
    expect(s[0].key).toBe(lineKey(line));
  });
});
