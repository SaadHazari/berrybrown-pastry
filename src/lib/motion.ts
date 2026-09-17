import type { Transition } from 'motion/react';

export const ease = {
  standard: [0.25, 0.46, 0.45, 0.94],
  dramatic: [0.76, 0, 0.24, 1],
  smooth: [0.65, 0, 0.35, 1],
  out: [0.16, 1, 0.3, 1],
} as const;

export const spring = {
  soft: { type: 'spring', stiffness: 260, damping: 26 } satisfies Transition,
  snappy: { type: 'spring', stiffness: 420, damping: 30 } satisfies Transition,
  bouncy: { type: 'spring', stiffness: 500, damping: 14 } satisfies Transition,
  sheet: { type: 'spring', stiffness: 320, damping: 34 } satisfies Transition,
};

export const tap = { scale: 0.96 };
