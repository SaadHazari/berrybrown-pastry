import { STATS } from '../../data/content';
import { media } from '../../data/media';
import { CountUp } from '../ui/CountUp';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Parallax } from '../ui/Parallax';
import { Photo } from '../ui/Photo';

export function Studio() {
  return (
    <section id="studio" className="section-more overflow-clip" aria-labelledby="studio-title">
      <div className="container-x grid items-center gap-2xl md:grid-cols-2">
        <div className="relative mx-auto w-full max-w-[28rem] pb-xl md:max-w-none">
          <Parallax offset={40} rotate={-2} className="relative z-10 w-[82%]">
            <Frame caption={media.studio.hands.label}>
              <Photo media={media.studio.hands} sizes="(min-width: 768px) 40vw, 80vw" />
            </Frame>
          </Parallax>
          <Parallax offset={90} rotate={3} className="absolute bottom-0 right-0 z-20 w-[44%]">
            <Frame>
              <Photo media={media.studio.berries} sizes="(min-width: 768px) 20vw, 40vw" />
            </Frame>
          </Parallax>
        </div>
        <div>
          <Heading id="studio-title" label="Our studio" title="We bake the cakes we would want at our own table." accent={['own', 'table.']} accentClassName="italic text-claret" />
          <p className="t-body mt-lg max-w-[52ch] text-cocoa-70">
            Our pastry team trained in hotel kitchens. We bake in small batches, from scratch, and finish every cake by hand. We do not make fondant characters. We do not take same-day orders. We only sell cakes we have made many times.
          </p>
          <dl className="mt-xl grid grid-cols-3 gap-md border-t border-cocoa-15 pt-lg">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="t-label mt-sm text-cocoa-70">{s.label}</dt>
                <dd className="font-label text-[2.058rem] leading-none md:text-[2.618rem]">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
