import { describe, expect, it } from 'vitest';
import { advancePhase, INTRO, shouldPlayIntro, TAGLINE } from './intro';
import { typingEnd } from './typing';

const fresh = { reducedMotion: false, played: false, hidden: false, scrollY: 0, hash: '' };

describe('hero intro', () => {
  it('plays on a fresh visit that opens at the top', () => {
    expect(shouldPlayIntro(fresh)).toBe(true);
    expect(shouldPlayIntro({ ...fresh, hash: '#top' })).toBe(true);
  });

  it('never plays with reduced motion, twice in one visit, in a background tab, or away from the top', () => {
    expect(shouldPlayIntro({ ...fresh, reducedMotion: true })).toBe(false);
    expect(shouldPlayIntro({ ...fresh, played: true })).toBe(false);
    expect(shouldPlayIntro({ ...fresh, hidden: true })).toBe(false);
    expect(shouldPlayIntro({ ...fresh, scrollY: 300 })).toBe(false);
    expect(shouldPlayIntro({ ...fresh, hash: '#faq' })).toBe(false);
  });

  it('only moves forward: hold → fly → typing → done, and can skip straight to done', () => {
    expect(advancePhase('hold', 'fly')).toBe('fly');
    expect(advancePhase('fly', 'typing')).toBe('typing');
    expect(advancePhase('typing', 'done')).toBe('done');
    expect(advancePhase('hold', 'done')).toBe('done');
    expect(advancePhase('done', 'fly')).toBe('done');
    expect(advancePhase('typing', 'fly')).toBe('typing');
  });

  it('types the tagline while the logo glides, and is over in about 2.5 s', () => {
    expect(TAGLINE).toEqual(['Made with heart,', 'not haste.']);
    expect(INTRO.type.startMs).toBeGreaterThan(INTRO.holdMs);
    expect(INTRO.type.startMs).toBeLessThan(INTRO.holdMs + INTRO.flyMs);
    expect(typingEnd(TAGLINE, INTRO.type)).toBeLessThanOrEqual(2600);
  });
});
