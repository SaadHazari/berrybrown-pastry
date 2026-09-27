import type { Transition } from 'motion/react';

/** The house curve: quick start, long soft landing. */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  smooth: [0.65, 0, 0.35, 1],
} as const;

export const spring = {
  soft: { type: 'spring', stiffness: 260, damping: 26 } satisfies Transition,
  snappy: { type: 'spring', stiffness: 420, damping: 30 } satisfies Transition,
};
