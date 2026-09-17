import { Pause, Play, Star } from 'lucide-react';
import { useState } from 'react';
import { RATING, REVIEWS } from '../../data/content';
import { cn } from '../../lib/cn';
import { Marquee } from '../ui/Marquee';
import { SectionHeading } from '../ui/SectionHeading';

const COLORS = ['bg-blush', 'bg-sage-soft', 'bg-oat', 'bg-paper'];

function Bubble({ r, i }: { r: (typeof REVIEWS)[number]; i: number }) {
  return (
    <figure className={cn('relative mx-2.5 w-[300px] shrink-0 rounded-[28px] rounded-bl-md p-6 md:w-[380px]', COLORS[i % COLORS.length])}>
      <div className="flex gap-0.5 text-berry" aria-label="5 stars">
        {Array.from({ length: 5 }, (_, k) => (
          <Star key={k} className="size-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-3 text-[1.05rem] leading-relaxed text-cocoa">“{r.text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-cocoa font-display text-lg text-cream">{r.name[0]}</span>
        <span className="text-sm">
          <span className="block font-semibold">{r.name}</span>
          <span className="text-milk">
            {r.area} · {r.cake}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Reviews() {
  const [offset] = useState(() => Math.floor(Math.random() * REVIEWS.length));
  const [paused, setPaused] = useState(false);
  const rotated = [...REVIEWS.slice(offset), ...REVIEWS.slice(0, offset)];
  return (
    <section id="reviews" className="relative py-16 md:py-28" aria-labelledby="reviews-title">
      <div className="container-x flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading id="reviews-title" kicker="kind words" title="Straight from the table" accent={['table']} />
        <div className="flex items-center gap-4">
          <p className="flex items-center gap-2 text-milk">
            <Star className="size-5 fill-berry text-berry" aria-hidden />
            <span className="font-display text-3xl text-cocoa">{RATING.score}</span> from {RATING.count}+ reviews
          </p>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="grid size-10 place-items-center rounded-full ring-1 ring-cocoa/15 transition hover:bg-oat motion-reduce:hidden"
            aria-label={paused ? 'Play scrolling reviews' : 'Pause scrolling reviews'}
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
        </div>
      </div>
      <div className="mt-12 space-y-5 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <Marquee duration={60} paused={paused}>
          {rotated.map((r, i) => (
            <Bubble key={r.name} r={r} i={i} />
          ))}
        </Marquee>
        <Marquee duration={70} reverse paused={paused} className="hidden md:flex">
          {[...rotated].reverse().map((r, i) => (
            <Bubble key={r.name} r={r} i={i + 2} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
