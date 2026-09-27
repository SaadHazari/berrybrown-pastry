import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Props = {
  selected: boolean;
  onSelect(): void;
  children: ReactNode;
  className?: string;
  role?: 'radio' | 'button';
};

/** Rectangle chip, 4 px corners. Selected = Cocoa fill + Butter text; unselected = Butter + hairline. */
export function Chip({ selected, onSelect, children, className, role = 'radio' }: Props) {
  return (
    <button
      type="button"
      role={role === 'radio' ? 'radio' : undefined}
      aria-checked={role === 'radio' ? selected : undefined}
      aria-pressed={role === 'button' ? selected : undefined}
      onClick={onSelect}
      className={cn('chip', selected && 'chip-on', className)}
    >
      {children}
    </button>
  );
}
