import { motion, useScroll, useTransform } from 'motion/react';
import { Expand } from 'lucide-react';
import { useRef } from 'react';
import { GALLERY } from '../../data/content';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { useUI } from '../../store/ui';
import { Img } from '../ui/Img';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { LoopVideo } from '../ui/LoopVideo';
import { TiltCard } from '../ui/TiltCard';

export function Gallery() {
  const { open } = useUI();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const colA = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const colB = useTransform(scrollYProgress, [0, 1], [-30, 50]);

  const tiles = GALLERY.map((g, i) => ({ ...g, index: i }));
  const columns = [tiles.filter((_, i) => i % 2 === 0), tiles.filter((_, i) => i % 2 === 1)];

  return (
    <section id="kitchen" ref={ref} className="relative overflow-hidden py-16 md:py-28" aria-labelledby="kitchen-title">
      <div className="container-x grid gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading id="kitchen-title" kicker="a peek inside" title="From Safa's kitchen" accent={['kitchen']} />
          <p className="mt-5 max-w-sm text-milk">Real butter, real fruit, and nothing rushed.</p>

          <Reveal delay={0.2} className="mt-8 hidden lg:block">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px]">
              <LoopVideo video={media.craft.video} poster={media.craft.poster} className="size-full object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3 py-1 font-hand text-lg text-cocoa">smoothing the buttercream…</span>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-5">
          {columns.map((col, ci) => (
            <motion.div key={ci} className={cn('flex flex-col gap-3 md:gap-5', ci === 1 && 'pt-12 md:pt-24')} style={{ y: ci === 0 ? colA : colB }}>
              {col.map((t) => (
                <Reveal key={t.src} delay={t.index * 0.05}>
                  <TiltCard className="rounded-[24px]" max={5}>
                    <button
                      type="button"
                      onClick={() => open({ kind: 'lightbox', index: t.index })}
                      className="group relative block w-full overflow-hidden rounded-[24px]"
                      aria-label={`Open photo: ${t.caption}`}
                    >
                      <Img src={t.src} alt={t.alt} wrapperClassName={t.tall ? 'aspect-[3/4]' : 'aspect-[4/3]'} className="transition-transform duration-700 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-cocoa/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <span className="absolute bottom-3 left-4 translate-y-2 font-hand text-xl text-cream opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        {t.caption}
                      </span>
                      <span className="absolute right-3 top-3 grid size-9 scale-75 place-items-center rounded-full bg-paper/85 text-cocoa opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                        <Expand className="size-4" />
                      </span>
                    </button>
                  </TiltCard>
                </Reveal>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
