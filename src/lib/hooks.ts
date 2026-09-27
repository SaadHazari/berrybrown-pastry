import { useEffect, useRef, useState, type RefObject } from 'react';
import { nextBarState, type BarState } from './topbar';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const on = () => setMatches(mql.matches);
    on();
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, [query]);
  return matches;
}

export const useIsDesktop = () => useMediaQuery('(min-width: 768px)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** True once the element has entered the viewport. Never goes back to false. */
export function useInView<T extends HTMLElement>(rootMargin = '0px 0px -10% 0px'): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!('IntersectionObserver' in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, seen]);
  return [ref, seen];
}

/**
 * Keeps an element mounted for `exitMs` after `open` turns false so a CSS exit transition can run,
 * and flips `shown` one frame after mount so the enter transition runs from the closed state.
 */
export function usePresence(open: boolean, exitMs: number): { mounted: boolean; shown: boolean } {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);
  return { mounted, shown };
}

export const useIsWide = () => useMediaQuery('(min-width: 1024px)');

/** Condense after 80 px; hide while scrolling down, show on scroll up; never hide while `locked`. */
export function useTopBar(locked: boolean): BarState {
  const [state, setState] = useState<BarState>({ condensed: false, hidden: false });
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const from = last;
      setState((prev) => nextBarState(prev, y, from, lockedRef.current));
      if (Math.abs(y - last) > 4) last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    if (locked) setState((prev) => (prev.hidden ? { ...prev, hidden: false } : prev));
  }, [locked]);
  return state;
}

/** The id of the section in the middle band of the viewport. */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(' ');
  useEffect(() => {
    const els = key
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
}
