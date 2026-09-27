import { Minus, Plus } from 'lucide-react';
import { MAX_QTY } from '../../lib/pricing';

export function QtyStepper({ value, onChange, min = 1, label = 'Quantity' }: { value: number; onChange(v: number): void; min?: number; label?: string }) {
  const btn = 'grid size-[42px] place-items-center rounded text-cocoa transition-colors hover:bg-cocoa/6 disabled:opacity-30';
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded border border-cocoa-15">
      <button type="button" className={btn} aria-label={value <= 1 && min === 0 ? 'Remove' : 'Decrease quantity'} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="size-[16px]" strokeWidth={1.75} />
      </button>
      <span className="t-price w-[32px] text-center" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} aria-label="Increase quantity" disabled={value >= MAX_QTY} onClick={() => onChange(value + 1)}>
        <Plus className="size-[16px]" strokeWidth={1.75} />
      </button>
    </div>
  );
}
