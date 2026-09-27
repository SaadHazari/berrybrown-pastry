import { motion, useReducedMotion } from 'motion/react';
import { Fragment } from 'react';
import { ease } from '../../lib/motion';

type Props = { text: string; className?: string; delay?: number; stagger?: number; accent?: string[]; accentClassName?: string };

/** A headline whose words rise out of a mask, once, when it scrolls into view. Screen readers get the plain text. */
export function SplitWords({ text, className, delay = 0, stagger = 0.07, accent = [], accentClassName = 'italic' }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span
                className={`inline-block ${accent.includes(w) ? accentClassName : ''}`}
                initial={reduce ? false : { y: '105%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 0.9, delay: delay + i * stagger, ease: ease.out }}
              >
                {w}
              </motion.span>
            </span>
            {/* The space sits between the word boxes: inside a box it would collapse, and lines could not break. */}
            {i < words.length - 1 && ' '}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
