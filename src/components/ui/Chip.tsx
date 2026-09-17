import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { spring } from '../../lib/motion';

type Props = {
  selected: boolean;
  onSelect(): void;
  children: ReactNode;
  className?: string;
  layoutGroup?: string;
  role?: 'radio' | 'tab';
};

/** Selectable pill; the selected background slides between siblings via layoutId. */
export function Chip({ selected, onSelect, children, className, layoutGroup, role = 'radio' }: Props) {
  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={role === 'radio' ? selected : undefined}
      aria-selected={role === 'tab' ? selected : undefined}
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative isolate rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-300',
        selected ? 'text-cream' : 'text-cocoa/80 hover:text-cocoa ring-1 ring-inset ring-cocoa/15 hover:ring-cocoa/30',
        className,
      )}
    >
      {selected && (
        <motion.span
          layoutId={layoutGroup ? `chip-${layoutGroup}` : undefined}
          className="absolute inset-0 -z-10 rounded-full bg-cocoa"
          transition={spring.soft}
        />
      )}
      {children}
    </motion.button>
  );
}
