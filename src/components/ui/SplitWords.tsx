import { motion, useReducedMotion } from 'motion/react';
import { ease } from '../../lib/motion';

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Animate when scrolled into view instead of on mount. */
  inView?: boolean;
  /** Words (exact match) to render in italic berry. */
  accent?: string[];
};

/** Headline where each word rises out of a mask. */
export function SplitWords({ text, className, delay = 0, stagger = 0.07, inView = false, accent = [] }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  const target = { y: '0%', opacity: 1, rotate: 0 };
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className={`inline-block will-change-transform ${accent.includes(w) ? 'italic text-berry' : ''}`}
            initial={reduce ? { opacity: 0 } : { y: '105%', opacity: 0, rotate: 4 }}
            {...(inView ? { whileInView: target, viewport: { once: true, margin: '-10% 0px' } } : { animate: target })}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: ease.out }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}
