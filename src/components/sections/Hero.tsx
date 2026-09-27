import { ArrowRight } from 'lucide-react';
import { RATING, cakeNumber } from '../../data/content';
import { media } from '../../data/media';
import { useLog } from '../../lib/live';
import { ButtonLink } from '../ui/Button';
import { StarIcon } from '../ui/Icons';
import { Photo } from '../ui/Photo';
import { Reveal } from '../ui/Reveal';

export function Hero() {
  const latest = useLog()[0];
  return (
    <section id="top" className="section-most" aria-labelledby="hero-title">
      <Reveal className="container-x grid gap-xl lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="t-label text-cocoa-70">Cake studio · Dubai</p>
          <h1 id="hero-title" className="t-title1 md:t-display mt-md max-w-[14ch]">
            Cakes made with heart, <em>not haste</em>.
          </h1>
          <p className="t-body mt-lg max-w-[38ch]">Six signature cakes. Made to order. Custom cakes for the days that matter.</p>
          <div className="mt-xl flex flex-wrap items-center gap-lg">
            <ButtonLink href="#custom" variant="claret">
              Design your cake
            </ButtonLink>
            <a href="#the-six" className="t-label link inline-flex items-center gap-xs">
              See the Six <ArrowRight className="size-[14px]" strokeWidth={1.75} aria-hidden />
            </a>
          </div>
          <p className="t-label mt-lg inline-flex items-center gap-xs text-cocoa-70">
            <StarIcon className="size-[12px]" /> {RATING.score} · {RATING.count}+ reviews
          </p>
        </div>
        <figure className="md:max-w-[26rem] lg:col-span-5 lg:max-w-none">
          <Photo media={media.hero.cake} eager />
          <figcaption className="t-caption mt-sm text-cocoa-70">
            Cake {cakeNumber(latest.n)} · {latest.for}
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
