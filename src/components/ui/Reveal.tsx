import { createElement, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useInView } from '../../lib/hooks';

type Tag = 'div' | 'section' | 'ul' | 'li' | 'figure';

/** The one allowed motion: a fade-and-rise (opacity 0→1, 12 px, 400 ms, once) on section entry. CSS in index.css. */
export function Reveal({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: Tag }) {
  const [ref, seen] = useInView<HTMLElement>();
  return createElement(as, { ref, className: cn('reveal', seen && 'reveal-in', className) }, children);
}
