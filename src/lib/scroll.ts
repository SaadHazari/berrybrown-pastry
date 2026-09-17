import type Lenis from 'lenis';

let lenis: Lenis | null = null;
let locks = 0;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.3 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Ref-counted page scroll lock shared by all overlays. */
export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  lenis?.stop();
  // Overlays are portalled to <body>, so the app root can go inert for AT/keyboard.
  document.getElementById('root')?.setAttribute('inert', '');
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.paddingRight = `${sbw}px`;
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  document.getElementById('root')?.removeAttribute('inert');
  document.documentElement.style.overflow = '';
  document.body.style.paddingRight = '';
}
