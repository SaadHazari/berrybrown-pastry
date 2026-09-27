import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

type Props = { children: ReactNode; className?: string; /** px travelled between entering and leaving the view; negative drifts the other way. */ offset?: number; rotate?: number };

/** Drifts its child while the page scrolls past. Holds still with reduced motion. */
export function Parallax({ children, className, offset = 40, rotate = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? { rotate } : { y, rotate }}>
      {children}
    </motion.div>
  );
}
