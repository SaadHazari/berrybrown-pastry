import { motion } from 'motion/react';
import { ease } from '../../lib/motion';

/** Hand-drawn underline that draws itself in. */
export function Squiggle({ className, delay = 0.2, color = 'currentColor' }: { className?: string; delay?: number; color?: string }) {
  return (
    <svg viewBox="0 0 220 18" fill="none" preserveAspectRatio="none" className={className} aria-hidden>
      <motion.path
        d="M3 12 C 30 4, 52 15, 80 9 S 130 3, 160 10 S 200 13, 217 6"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay, ease: ease.smooth }}
      />
    </svg>
  );
}

export function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.4 2.6.1.2.4.2.5 0 .8-1.4 2.3-2.6 4.4-2.6 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
