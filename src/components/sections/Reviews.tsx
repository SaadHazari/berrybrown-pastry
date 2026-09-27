import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { RATING, type Review } from '../../data/content';
import { cn } from '../../lib/cn';
import { useReviews } from '../../lib/live';
import { DriftRow } from '../ui/DriftRow';
import { Heading } from '../ui/Heading';
import { StarIcon } from '../ui/Icons';

type Tone = 'rose' | 'butter' | 'cocoa';
const TONES: Tone[] = ['rose', 'butter', 'cocoa', 'rose'];
const BUBBLE: Record<Tone, string> = { rose: 'bg-rose text-cocoa', butter: 'border border-cocoa-15 bg-butter text-cocoa', cocoa: 'bg-cocoa text-butter' };
const MUTED: Record<Tone, string> = { rose: 'text-cocoa', butter: 'text-cocoa-70', cocoa: 'text-butter-60' };

function Bubble({ r, i }: { r: Review; i: number }) {
  const tone = TONES[i % TONES.length];
  return (
    <figure className={cn('bubble-tail relative mx-sm mb-md w-[300px] shrink-0 rounded p-lg md:w-[380px]', BUBBLE[tone])}>
      <div className="flex gap-2xs" role="img" aria-label="5 stars">
        {Array.from({ length: 5 }, (_, k) => (
          <StarIcon key={k} className="size-[14px]" />
        ))}
      </div>
      <blockquote className="t-body mt-md">“{r.text}”</blockquote>
      <figcaption className="mt-lg flex items-center gap-sm">
        <span className={cn('t-price grid size-[40px] shrink-0 place-items-center rounded-full', tone === 'cocoa' ? 'bg-butter text-cocoa' : 'bg-cocoa text-butter')}>{r.name[0]}</span>
        <span>
          <span className="t-price block">{r.name}</span>
          <span className={cn('t-caption', MUTED[tone])}>
            {r.area} · {r.cake}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Reviews() {
  const reviews = useReviews();
  const [offset] = useState(() => Math.floor(Math.random() * 5));
  const [paused, setPaused] = useState(false);
  const start = offset % reviews.length;
  const rotated = [...reviews.slice(start), ...reviews.slice(0, start)];

  return (
    <section id="reviews" className="section-more overflow-clip" aria-labelledby="reviews-title">
      <div className="container-x flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
        <Heading id="reviews-title" label="Kind words" title="Straight from the table." />
        <div className="flex items-center gap-md">
          <p className="t-callout text-cocoa-70">
            <span className="font-label text-[2.058rem] leading-none text-claret">{RATING.score}</span> from {RATING.count}+ reviews
          </p>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="grid size-[44px] place-items-center rounded border border-cocoa-15 transition-colors hover:bg-cocoa/6 motion-reduce:hidden"
            aria-label={paused ? 'Play the moving reviews' : 'Pause the moving reviews'}
            aria-pressed={paused}
          >
            {paused ? <Play className="size-[16px]" aria-hidden /> : <Pause className="size-[16px]" aria-hidden />}
          </button>
        </div>
      </div>
      <div className="mt-xl space-y-md [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <DriftRow duration={60} paused={paused}>
          {rotated.map((r, i) => (
            <Bubble key={`a-${i}`} r={r} i={i} />
          ))}
        </DriftRow>
        <div aria-hidden>
          <DriftRow duration={70} reverse paused={paused} className="hidden md:flex">
            {[...rotated].reverse().map((r, i) => (
              <Bubble key={`b-${i}`} r={r} i={i + 2} />
            ))}
          </DriftRow>
        </div>
      </div>
    </section>
  );
}
