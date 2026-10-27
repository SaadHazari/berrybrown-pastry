import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Review } from '../../data/content';
import { cn } from '../../lib/cn';
import { fillRow } from '../../lib/fillRow';
import { useReviews } from '../../lib/live';
import { DriftRow } from '../ui/DriftRow';
import { Heading } from '../ui/Heading';

type Tone = 'rose' | 'butter' | 'cocoa';
const TONES: Tone[] = ['rose', 'butter', 'cocoa', 'rose'];
const BUBBLE: Record<Tone, string> = { rose: 'bg-rose text-cocoa', butter: 'border border-cocoa-15 bg-butter text-cocoa', cocoa: 'bg-cocoa text-butter' };
const MUTED: Record<Tone, string> = { rose: 'text-cocoa', butter: 'text-cocoa-70', cocoa: 'text-butter-60' };

function Bubble({ r, i, className }: { r: Review; i: number; className?: string }) {
  const tone = TONES[i % TONES.length];
  return (
    <figure className={cn('bubble-tail relative mb-md shrink-0 rounded p-lg', BUBBLE[tone], className)}>
      <blockquote className="t-body">“{r.text}”</blockquote>
      <figcaption className="mt-lg flex items-center gap-sm">
        <span className={cn('t-price grid size-[40px] shrink-0 place-items-center rounded-full', tone === 'cocoa' ? 'bg-butter text-cocoa' : 'bg-cocoa text-butter')}>{r.name[0]}</span>
        <span className="min-w-0">
          <span className="t-price block">{r.name}</span>
          <span className={cn('t-caption', MUTED[tone])}>
            {r.area} · {r.cake}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

const DRIFT_CARD = 'mx-sm w-[380px]';
const ARROW = 'grid size-[44px] place-items-center rounded-full border border-cocoa-15 transition-colors hover:bg-cocoa/6';

export function Reviews() {
  const reviews = useReviews();
  const [offset] = useState(() => Math.floor(Math.random() * 5));
  const [paused, setPaused] = useState(false);
  const rail = useRef<HTMLUListElement>(null);
  // No published review yet: no section at all.
  if (reviews.length === 0) return null;
  const start = offset % reviews.length;
  const ordered = [...reviews.slice(start), ...reviews.slice(0, start)];
  // At least 8 cards per copy (about 3,200 px), so the drift never shows a gap, even with one real review.
  const rotated = fillRow(ordered, 8);

  // Phones: one card per swipe. The arrows move the rail by one card, for people who do not swipe.
  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * card.offsetWidth, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section id="reviews" className="section-more overflow-clip" aria-labelledby="reviews-title">
      <div className="container-x flex flex-row items-end justify-between gap-lg">
        <Heading id="reviews-title" label="Kind words" title="Straight from the table." />
        <div className="flex shrink-0 gap-xs md:hidden">
          <button type="button" onClick={() => step(-1)} className={ARROW} aria-label="Previous review">
            <ChevronLeft className="size-[18px]" aria-hidden />
          </button>
          <button type="button" onClick={() => step(1)} className={ARROW} aria-label="Next review">
            <ChevronRight className="size-[18px]" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="hidden size-[44px] shrink-0 place-items-center rounded border border-cocoa-15 transition-colors hover:bg-cocoa/6 md:grid motion-reduce:hidden"
          aria-label={paused ? 'Play the moving reviews' : 'Pause the moving reviews'}
          aria-pressed={paused}
        >
          {paused ? <Play className="size-[16px]" aria-hidden /> : <Pause className="size-[16px]" aria-hidden />}
        </button>
      </div>

      {/* Phones: a still row you swipe. Each card stops at the left edge, the next one peeks in. */}
      <ul
        ref={rail}
        className="no-scrollbar mt-xl flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-md px-md md:hidden"
        aria-label="Reviews"
      >
        {ordered.map((r, i) => (
          <li key={`${r.name}-${i}`} className="flex shrink-0 snap-start pr-sm last:pr-md">
            <Bubble r={r} i={i} className="w-[calc(100vw-4.5rem)] max-w-[380px]" />
          </li>
        ))}
      </ul>

      {/* Tablets and up: the two drifting rows. */}
      <div className="mt-xl hidden space-y-md [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] md:block">
        <DriftRow duration={60} paused={paused}>
          {rotated.map((r, i) => (
            <Bubble key={`a-${i}`} r={r} i={i} className={DRIFT_CARD} />
          ))}
        </DriftRow>
        <div aria-hidden>
          <DriftRow duration={70} reverse paused={paused}>
            {[...rotated].reverse().map((r, i) => (
              <Bubble key={`b-${i}`} r={r} i={i + 2} className={DRIFT_CARD} />
            ))}
          </DriftRow>
        </div>
      </div>
    </section>
  );
}
