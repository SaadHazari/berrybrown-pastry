export type FlyDetail = { src: string; from: DOMRect };

const EVENT = 'bb:fly';

/** Launch a thumbnail from `from` towards the visible cart button. */
export function flyToCart(src: string, fromEl: Element | null) {
  if (!fromEl) return;
  window.dispatchEvent(new CustomEvent<FlyDetail>(EVENT, { detail: { src, from: fromEl.getBoundingClientRect() } }));
}

export function onFly(handler: (d: FlyDetail) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<FlyDetail>).detail);
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

export function cartTargetRect(): DOMRect | null {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]'));
  const visible = targets.find((t) => t.offsetParent !== null && t.getBoundingClientRect().width > 0);
  return visible?.getBoundingClientRect() ?? null;
}
