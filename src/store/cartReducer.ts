import { MAX_QTY, resolveLine, type LineInput } from '../lib/pricing';

export type CartLine = LineInput & { key: string };

export type CartAction =
  | { type: 'add'; line: LineInput }
  | { type: 'qty'; key: string; qty: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: CartLine[] };

export const lineKey = (l: LineInput) => [l.productId, l.sizeId, l.flavourId, (l.message ?? '').trim()].join('|');

const clamp = (q: number) => Math.max(0, Math.min(MAX_QTY, Math.floor(q)));

function isValid(l: LineInput): boolean {
  try {
    resolveLine(l);
    return clamp(l.qty) > 0;
  } catch {
    return false;
  }
}

export function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.line);
      const existing = state.find((l) => l.key === key);
      if (existing) {
        return state.map((l) => (l.key === key ? { ...l, qty: clamp(l.qty + action.line.qty) } : l));
      }
      return [...state, { ...action.line, message: action.line.message?.trim() || undefined, qty: clamp(action.line.qty), key }];
    }
    case 'qty': {
      const qty = clamp(action.qty);
      if (qty === 0) return state.filter((l) => l.key !== action.key);
      return state.map((l) => (l.key === action.key ? { ...l, qty } : l));
    }
    case 'remove':
      return state.filter((l) => l.key !== action.key);
    case 'clear':
      return [];
    case 'hydrate':
      return action.lines.filter(isValid).map((l) => ({ ...l, qty: clamp(l.qty), key: lineKey(l) }));
  }
}
