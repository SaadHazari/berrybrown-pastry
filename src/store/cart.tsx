import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { subtotal as calcSubtotal, type LineInput } from '../lib/pricing';
import { cartReducer, type CartLine } from './cartReducer';

const STORAGE_KEY = 'bb-cart-v2';

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** Increments on every add — drive "bounce" animations from it. */
  pulse: number;
  add(line: LineInput): void;
  setQty(key: string, qty: number): void;
  remove(key: string): void;
  clear(): void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, [], () => cartReducer([], { type: 'hydrate', lines: readStored() }));
  const [pulse, setPulse] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable (private mode) — cart still works for this visit */
    }
  }, [lines]);

  const add = useCallback((line: LineInput) => {
    dispatch({ type: 'add', line });
    setPulse((p) => p + 1);
  }, []);
  const setQty = useCallback((key: string, qty: number) => dispatch({ type: 'qty', key, qty }), []);
  const remove = useCallback((key: string) => dispatch({ type: 'remove', key }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: calcSubtotal(lines),
      pulse,
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, pulse, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
