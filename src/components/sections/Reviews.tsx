import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { RATING } from '../../data/content';
import { useReviews } from '../../lib/live';
import { cn } from '../../lib/cn';
import { StarIcon } from '../ui/Icons';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export function Reviews() {
  const reviews = useReviews();
  const ref = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const step = () => {
    const el = ref.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return 0;
    return card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0');
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => {
      const s = step();
      if (s) setIndex(Math.round(el.scrollLeft / s));
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, []);

  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * step(), behavior: 'smooth' });
  const goTo = (i: number) => ref.current?.scrollTo({ left: i * step(), behavior: 'smooth' });

  return (
    <section id="reviews" className="section-more" aria-labelledby="reviews-title">
      <Reveal className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <SectionHeading id="reviews-title" title="Kind words" />
          <p className="t-price">
            <span className="text-claret">{RATING.score}</span> · {RATING.count}+ reviews
          </p>
        </div>

        <ul ref={ref} className="no-scrollbar mt-xl flex snap-x snap-mandatory gap-md overflow-x-auto" role="list" aria-label="Customer reviews">
          {reviews.map((r, i) => (
            <li key={`${r.name}-${i}`} className="w-full shrink-0 snap-start md:w-[calc((100%-2*var(--spacing-md))/3)]">
              <figure className={cn('flex h-full flex-col rounded border border-cocoa-15 p-lg', i % 2 ? 'bg-rose' : 'bg-butter')}>
                <div className="flex gap-2xs text-cocoa" role="img" aria-label="5 stars">
                  {Array.from({ length: 5 }, (_, k) => (
                    <StarIcon key={k} className="size-[12px]" />
                  ))}
                </div>
                <blockquote className="t-body mt-md">“{r.text}”</blockquote>
                <figcaption className="mt-auto pt-lg">
                  <span className="t-price block">{r.name}</span>
                  <span className="t-caption text-cocoa">
                    {r.area} · {r.cake}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-lg hidden gap-sm md:flex">
          <button type="button" onClick={() => go(-1)} className="grid size-[44px] place-items-center rounded border border-cocoa-15 text-cocoa transition-colors hover:bg-cocoa/6" aria-label="Previous reviews">
            <ArrowLeft className="size-[18px]" strokeWidth={1.6} />
          </button>
          <button type="button" onClick={() => go(1)} className="grid size-[44px] place-items-center rounded border border-cocoa-15 text-cocoa transition-colors hover:bg-cocoa/6" aria-label="Next reviews">
            <ArrowRight className="size-[18px]" strokeWidth={1.6} />
          </button>
        </div>

        <ol className="mt-md flex justify-center gap-sm md:hidden" aria-label="Review pages">
          {reviews.map((r, i) => (
            <li key={`${r.name}-${i}`}>
              <button type="button" onClick={() => goTo(i)} className="grid size-[24px] place-items-center" aria-label={`Review ${i + 1}`} aria-current={i === index ? 'true' : undefined}>
                <span className={cn('block size-[6px] rounded-full', i === index ? 'bg-cocoa' : 'bg-cocoa-15')} />
              </button>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
