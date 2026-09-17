import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { FAVOURITE_IDS, getProduct, type Product } from '../../data/products';
import { useUI } from '../../store/ui';
import { ProductCard } from '../shop/ProductCard';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

const favourites = FAVOURITE_IDS.map(getProduct).filter(Boolean) as Product[];
const TILTS = [-2, 1.5, -1, 2, -1.5, 1];

/** Drag (mouse) + swipe (touch) carousel built on native scrolling. */
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ down: false, x: 0, left: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    state.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.down || !ref.current) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 5 && !s.moved) {
      s.moved = true;
      ref.current.style.scrollSnapType = 'none';
      ref.current.setPointerCapture(e.pointerId);
    }
    if (s.moved) ref.current.scrollLeft = s.left - dx;
  };
  const end = () => {
    if (!ref.current) return;
    state.current.down = false;
    ref.current.style.scrollSnapType = '';
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (state.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      state.current.moved = false;
    }
  };
  return { ref, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerLeave: end, onClickCapture } };
}

export function Favourites() {
  const { open } = useUI();
  const { ref, handlers } = useDragScroll();
  const { scrollXProgress } = useScroll({ container: ref });
  const progress = useSpring(scrollXProgress, { stiffness: 200, damping: 30 });

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('article');
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 20), behavior: 'smooth' });
  };

  return (
    <section id="favourites" className="relative py-16 md:py-28" aria-labelledby="fav-title">
      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading id="fav-title" kicker="baked this week" title="Our favourites" accent={['favourites']} />
        <div className="flex items-center gap-3">
          <div className="hidden gap-2 md:flex">
            <button type="button" onClick={() => nudge(-1)} className="grid size-12 place-items-center rounded-full ring-1 ring-cocoa/15 transition hover:bg-cocoa hover:text-cream" aria-label="Previous cakes">
              <ArrowLeft className="size-5" />
            </button>
            <button type="button" onClick={() => nudge(1)} className="grid size-12 place-items-center rounded-full ring-1 ring-cocoa/15 transition hover:bg-cocoa hover:text-cream" aria-label="More cakes">
              <ArrowRight className="size-5" />
            </button>
          </div>
          <Button variant="dark" onClick={() => open({ kind: 'menu' })}>
            See the full menu
          </Button>
        </div>
      </div>

      <div
        ref={ref}
        {...handlers}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-6 md:cursor-grab scroll-px-5 md:px-[max(40px,calc((100vw_-_1280px)/2_+_40px))] md:scroll-px-[max(40px,calc((100vw_-_1280px)/2_+_40px))] md:active:cursor-grabbing"
        data-lenis-prevent-wheel
        role="list"
        aria-label="Favourite cakes"
      >
        {favourites.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className="w-[78vw] shrink-0 snap-start sm:w-[44vw] md:w-[340px] lg:w-[360px]">
            <div role="listitem">
              <ProductCard product={p} tilt={TILTS[i % TILTS.length]} />
            </div>
          </Reveal>
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </div>

      <div className="container-x mt-2">
        <div className="h-[3px] overflow-hidden rounded-full bg-oat">
          <motion.div className="h-full origin-left rounded-full bg-berry" style={{ scaleX: progress }} />
        </div>
      </div>
    </section>
  );
}
