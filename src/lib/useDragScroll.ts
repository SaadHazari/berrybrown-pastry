import { useRef, type MouseEvent, type PointerEvent } from 'react';

/** Mouse drag on a native horizontal scroller. Touch keeps native swipe. A drag never fires the click under it. */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const state = useRef({ down: false, x: 0, left: 0, moved: false });

  const onPointerDown = (e: PointerEvent<T>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    state.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: PointerEvent<T>) => {
    const s = state.current;
    const el = ref.current;
    if (!s.down || !el) return;
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) > 5) {
      s.moved = true;
      el.style.scrollSnapType = 'none';
      el.setPointerCapture(e.pointerId);
    }
    if (s.moved) el.scrollLeft = s.left - dx;
  };
  const end = () => {
    state.current.down = false;
    if (ref.current) ref.current.style.scrollSnapType = '';
  };
  const onClickCapture = (e: MouseEvent<T>) => {
    if (!state.current.moved) return;
    e.preventDefault();
    e.stopPropagation();
    state.current.moved = false;
  };
  return { ref, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerLeave: end, onClickCapture } };
}
