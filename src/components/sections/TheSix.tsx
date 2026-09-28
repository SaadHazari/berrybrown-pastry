import { motion, useReducedMotion, useScroll } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PHOTO_NOTE } from '../../data/content';
import { PRODUCTS } from '../../data/products';
import { useDragScroll } from '../../lib/useDragScroll';
import { useUI } from '../../store/ui';
import { ProductCard } from '../shop/ProductCard';
import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';
import { Rise } from '../ui/Rise';

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick(): void }) {
  const Icon = dir < 0 ? ArrowLeft : ArrowRight;
  return (
    <button type="button" onClick={onClick} className="grid size-[44px] place-items-center rounded border border-cocoa-15 text-cocoa transition-colors hover:bg-cocoa hover:text-butter" aria-label={dir < 0 ? 'Previous cakes' : 'More cakes'}>
      <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
    </button>
  );
}

export function TheSix() {
  const { open } = useUI();
  const reduce = useReducedMotion();
  const { ref, handlers } = useDragScroll<HTMLUListElement>();
  const { scrollXProgress } = useScroll({ container: ref });

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    const card = el?.querySelector('li');
    if (!el) return;
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 29), behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section id="the-six" className="section-more" aria-labelledby="six-title">
      <div className="container-x flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
        <Heading id="six-title" label="The Six" title="Our signature cakes." oneliner="Six cakes. Three sizes. 24 hours’ notice." />
        <div className="flex items-center gap-sm">
          <div className="hidden gap-xs md:flex">
            <Arrow dir={-1} onClick={() => nudge(-1)} />
            <Arrow dir={1} onClick={() => nudge(1)} />
          </div>
          <Button variant="cocoa" onClick={() => open({ kind: 'menu' })}>
            See the full menu
          </Button>
        </div>
      </div>

      <ul ref={ref} {...handlers} className="no-scrollbar carousel-pad mt-xl flex snap-x snap-mandatory gap-lg overflow-x-auto pb-md md:cursor-grab md:active:cursor-grabbing" aria-label="The Six">
        {PRODUCTS.map((p, i) => (
          <li key={p.id} className="w-[78vw] shrink-0 snap-start sm:w-[44vw] md:w-[340px] lg:w-[360px]">
            <Rise delay={i * 0.06} className="h-full">
              <ProductCard product={p} index={i} />
            </Rise>
          </li>
        ))}
        <li className="w-px shrink-0" aria-hidden />
      </ul>

      <div className="container-x mt-sm">
        <div className="h-[2px] overflow-hidden rounded-full bg-cocoa-15">
          <motion.div className="h-full origin-left bg-claret" style={{ scaleX: scrollXProgress }} />
        </div>
        <p className="t-caption mt-lg text-cocoa-70">{PHOTO_NOTE}</p>
      </div>
    </section>
  );
}
