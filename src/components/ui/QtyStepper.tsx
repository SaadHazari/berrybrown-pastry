import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { useRef } from 'react';
import { MAX_QTY } from '../../lib/pricing';
import { cn } from '../../lib/cn';

export function QtyStepper({ value, onChange, min = 1, size = 'md', label = 'Quantity' }: { value: number; onChange(v: number): void; min?: number; size?: 'sm' | 'md'; label?: string }) {
  const dir = useRef(1);
  const btn = cn('grid place-items-center rounded-full text-cocoa transition hover:bg-oat active:scale-90 disabled:opacity-30', size === 'sm' ? 'size-8' : 'size-11');
  return (
    <div role="group" aria-label={label} className={cn('inline-flex items-center rounded-full bg-paper ring-1 ring-cocoa/10', size === 'sm' ? 'p-0.5' : 'p-1')}>
      <button
        type="button"
        className={btn}
        aria-label={value <= 1 && min === 0 ? 'Remove' : 'Decrease quantity'}
        disabled={value <= min}
        onClick={() => {
          dir.current = -1;
          onChange(value - 1);
        }}
      >
        <Minus className="size-4" />
      </button>
      <span className={cn('relative grid overflow-hidden text-center font-semibold tabular-nums', size === 'sm' ? 'h-8 w-7 text-sm' : 'h-11 w-9')} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="col-start-1 row-start-1 grid place-items-center"
            initial={{ y: dir.current * 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: dir.current * -16, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        className={btn}
        aria-label="Increase quantity"
        disabled={value >= MAX_QTY}
        onClick={() => {
          dir.current = 1;
          onChange(value + 1);
        }}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
