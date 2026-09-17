import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { ease } from '../../lib/motion';

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'span';
};

export function Reveal({ children, delay = 0, y = 28, className, as = 'div' }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, delay, ease: ease.out }}
    >
      {children}
    </Tag>
  );
}
