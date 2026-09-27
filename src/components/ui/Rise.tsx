import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { ease } from '../../lib/motion';

const TAGS = { div: motion.div, li: motion.li, figure: motion.figure, p: motion.p };

/** Fade and rise 24 px the first time it scrolls into view. Renders in place with reduced motion. */
export function Rise({ children, className, delay = 0, as = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: keyof typeof TAGS }) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: ease.out }}
    >
      {children}
    </Tag>
  );
}
