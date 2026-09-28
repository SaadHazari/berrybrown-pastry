import { useSyncExternalStore } from 'react';
import { readFlag, writeFlag } from './storage';
import type { TypeTiming } from './typing';

/**
 * The hero intro, once per visit. The logo sits big where the tagline goes ('hold'), glides into the top bar ('fly'),
 * lands on the bar's own logo while the tagline types ('typing'), then the caret goes ('done').
 */
export type IntroPhase = 'hold' | 'fly' | 'typing' | 'done';

export const TAGLINE = ['Made with heart,', 'not haste.'] as const;

export const INTRO: { holdMs: number; flyMs: number; caretMs: number; type: TypeTiming } = {
  holdMs: 450,
  flyMs: 750,
  caretMs: 600,
  // Typing starts once the gliding logo has cleared the first line (about 65% of the glide), even on phones.
  type: { startMs: 950, charMs: 55, lineGapMs: 250 },
};

const KEY = 'bb-intro-played';
const ORDER: Record<IntroPhase, number> = { hold: 0, fly: 1, typing: 2, done: 3 };

/** Only a fresh visit that opens at the top, in a visible tab, without reduced motion. */
export function shouldPlayIntro(e: { reducedMotion: boolean; played: boolean; hidden: boolean; scrollY: number; hash: string }): boolean {
  return !e.reducedMotion && !e.played && !e.hidden && e.scrollY < 40 && (e.hash === '' || e.hash === '#top');
}

/** Phases only move forward, so a late timer can never restart a finished intro. */
export function advancePhase(current: IntroPhase, next: IntroPhase): IntroPhase {
  return ORDER[next] > ORDER[current] ? next : current;
}

let phase: IntroPhase | null = null;
const listeners = new Set<() => void>();

function firstPhase(): IntroPhase {
  if (typeof window === 'undefined') return 'done';
  const play = shouldPlayIntro({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    played: readFlag(KEY),
    hidden: document.visibilityState === 'hidden',
    scrollY: window.scrollY,
    hash: window.location.hash,
  });
  if (play) writeFlag(KEY);
  return play ? 'hold' : 'done';
}

export function getIntroPhase(): IntroPhase {
  if (phase === null) phase = firstPhase();
  return phase;
}

export function setIntroPhase(next: IntroPhase): void {
  const moved = advancePhase(getIntroPhase(), next);
  if (moved === phase) return;
  phase = moved;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useIntroPhase(): IntroPhase {
  return useSyncExternalStore(subscribe, getIntroPhase, () => 'done');
}
