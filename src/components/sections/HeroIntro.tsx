import { animate } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { getIntroPhase, INTRO, setIntroPhase, TAGLINE, useIntroPhase } from '../../lib/intro';
import { ease } from '../../lib/motion';
import { typedCounts, typingEnd } from '../../lib/typing';

const FULL = TAGLINE.map((line) => line.length);
const TYPED_BY = typingEnd(TAGLINE, INTRO.type);

/** The intro clock: the glide starts after the hold, the caret goes after the last letter. Any scroll, key or tap ends it at once. */
export function useIntroTimeline() {
  const done = useIntroPhase() === 'done';
  useEffect(() => {
    if (done) return;
    const finish = () => setIntroPhase('done');
    const timers = [window.setTimeout(() => setIntroPhase('fly'), INTRO.holdMs), window.setTimeout(finish, TYPED_BY + INTRO.caretMs)];
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, finish, { passive: true }));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      events.forEach((e) => window.removeEventListener(e, finish));
    };
  }, [done]);
}

function Caret() {
  return (
    <span data-caret className="relative inline-block w-0">
      <span className="absolute -bottom-[0.06em] left-[0.04em] h-[0.84em] w-[0.05em] animate-caret bg-current" />
    </span>
  );
}

/** The hero tagline, typed during the intro. The untyped rest of each line waits invisibly beside it, so nothing shifts. */
export function Tagline() {
  const done = useIntroPhase() === 'done';
  const [counts, setCounts] = useState<number[]>(() => (done ? FULL : FULL.map(() => 0)));

  useEffect(() => {
    if (done) {
      setCounts(FULL);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const next = typedCounts(TAGLINE, performance.now() - start, INTRO.type);
      setCounts((prev) => (prev.every((n, i) => n === next[i]) ? prev : next));
      if (next.some((n, i) => n < FULL[i])) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  const typing = counts.findIndex((n, i) => n < FULL[i]);
  const caretLine = typing === -1 ? TAGLINE.length - 1 : typing;
  const caret = !done && counts[0] > 0;
  return (
    <span aria-hidden>
      {TAGLINE.map((line, i) => (
        <span key={line} className={cn('block whitespace-nowrap', i === 1 && 'italic text-cocoa-70')}>
          <span data-typed>{line.slice(0, counts[i])}</span>
          {caret && i === caretLine && <Caret />}
          <span className="invisible">{line.slice(counts[i])}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * The full logo during the intro. It sits over the tagline's place (`slot`), then glides onto the top bar's logo (#bar-logo).
 * Both are the same wide artwork, so the glide is one move and one even scale. It lives above the top bar, in <body>.
 */
export function IntroLogo({ slot }: { slot: RefObject<HTMLElement | null> }) {
  const phase = useIntroPhase();
  const active = phase === 'hold' || phase === 'fly';
  const ref = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState<{ left: number; top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    if (!active) return;
    // Measured before the first paint, and again if late fonts or a resize move the tagline while the logo still holds.
    const measure = () => {
      const r = slot.current?.getBoundingClientRect();
      if (r && getIntroPhase() === 'hold') setBox({ left: r.left, top: r.top, height: r.height });
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, slot]);

  useEffect(() => {
    const el = ref.current;
    if (phase !== 'fly' || !el) return;
    const to = document.getElementById('bar-logo')?.getBoundingClientRect();
    const from = el.getBoundingClientRect();
    if (!to || !from.height) {
      setIntroPhase('typing');
      return;
    }
    const glide = animate(el, { x: to.left - from.left, y: to.top - from.top, scale: to.height / from.height }, { duration: INTRO.flyMs / 1000, ease: ease.smooth });
    void glide.then(() => setIntroPhase('typing'));
    return () => glide.stop();
  }, [phase]);

  if (!active || !box) return null;
  return createPortal(
    <img
      ref={ref}
      id="intro-logo"
      src="/brand/berrybrown-logo-horizontal.svg"
      alt=""
      aria-hidden
      width={437}
      height={137}
      className="pointer-events-none fixed z-[60] w-auto origin-top-left"
      style={{ left: box.left, top: box.top, height: box.height }}
    />,
    document.body,
  );
}
