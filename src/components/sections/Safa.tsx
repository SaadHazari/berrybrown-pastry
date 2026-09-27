import { STATS } from '../../data/content';
import { media } from '../../data/media';
import { Photo } from '../ui/Photo';
import { Reveal } from '../ui/Reveal';

export function Safa() {
  return (
    <section id="safa" className="section-more" aria-labelledby="safa-title">
      <Reveal className="container-x grid gap-xl lg:grid-cols-12 lg:items-center lg:gap-2xl">
        <div className="lg:col-span-5">
          <Photo media={media.studio.hands} />
        </div>
        <div className="lg:col-span-7">
          <p className="t-label text-cocoa-70">Chef Safa</p>
          <h2 id="safa-title" className="t-title3 mt-md max-w-[30ch]">
            Trained in pastry. Years in hotel kitchens. Every cake, her <span className="text-claret">hands</span>.
          </h2>
          <p className="t-body mt-lg max-w-[58ch]">
            Safa trained in pastry and spent years in hotel kitchens before she opened the studio. We bake in small batches, from scratch, and every cake leaves
            through her hands. We do not make fondant characters. We do not take same-day orders. We do not sell anything she has not made at least five times.
          </p>
          <ul className="t-price mt-xl flex flex-wrap gap-x-lg gap-y-xs border-t border-cocoa-15 pt-md" aria-label="Studio in numbers">
            {STATS.map((s) => (
              <li key={s.value}>{s.value}</li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
