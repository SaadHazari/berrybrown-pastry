import { MARQUEE_ITEMS } from '../../data/content';
import { Marquee } from '../ui/Marquee';
import { Heart } from '../ui/Squiggle';

export function TrustMarquee() {
  return (
    <div className="relative z-10 -mt-6 overflow-hidden py-8 md:-mt-8" aria-label="Why people love Berry Brown">
      <div className="-mx-4 rotate-[-2deg] bg-berry py-4 text-cream shadow-soft">
        <Marquee duration={34}>
          {MARQUEE_ITEMS.map((t) => (
            <span key={t} className="flex items-center gap-6 pr-6 font-display text-xl italic md:text-2xl">
              {t}
              <Heart className="size-4 text-blush" />
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
