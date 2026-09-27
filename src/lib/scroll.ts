let locks = 0;

/** Ref-counted page scroll lock shared by all overlays. */
export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  // Overlays are portalled to <body>, so the app root can go inert for AT/keyboard.
  document.getElementById('root')?.setAttribute('inert', '');
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.paddingRight = `${sbw}px`;
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  document.getElementById('root')?.removeAttribute('inert');
  document.documentElement.style.overflow = '';
  document.body.style.paddingRight = '';
}
