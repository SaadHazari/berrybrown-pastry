import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { GALLERY } from '../../data/content';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { useUI } from '../../store/ui';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Photo } from '../ui/Photo';
import { Rise } from '../ui/Rise';

export function Kitchen() {
  const { open } = useUI();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const colA = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const colB = useTransform(scrollYProgress, [0, 1], [-30, 50]);
  const tiles = GALLERY.map((g, index) => ({ ...g, index }));
  const columns = [tiles.filter((_, i) => i % 2 === 0), tiles.filter((_, i) => i % 2 === 1)];

  return (
    <section id="kitchen" ref={ref} className="section-more overflow-clip" aria-labelledby="kitchen-title">
      <div className="container-x grid gap-2xl lg:grid-cols-[360px_1fr] lg:gap-3xl">
        <div className="lg:sticky lg:top-[120px] lg:self-start">
          <Heading id="kitchen-title" label="From our kitchen" title="Real butter, real fruit, nothing rushed." />
          <Rise delay={0.2} className="mt-xl hidden lg:block">
            <Frame caption={media.kitchen.piping.label}>
              <Photo media={media.kitchen.piping} sizes="340px" />
            </Frame>
          </Rise>
        </div>
        <div className="grid grid-cols-2 gap-sm md:gap-lg">
          {columns.map((col, ci) => (
            <motion.div key={ci} className={cn('flex flex-col gap-sm md:gap-lg', ci === 1 && 'pt-xl md:pt-2xl')} style={reduce ? undefined : { y: ci === 0 ? colA : colB }}>
              {col.map((t) => (
                <Rise key={t.caption} delay={t.index * 0.05}>
                  <button type="button" onClick={() => open({ kind: 'lightbox', index: t.index })} className="group relative block w-full overflow-hidden rounded" aria-label={`Open photo: ${t.caption}`}>
                    <Photo media={t.image} ratio={t.tall ? '3 / 4' : '4 / 3'} zoom sizes="(min-width: 1024px) 400px, 45vw" />
                    <span className="t-label absolute bottom-sm left-sm translate-y-2 rounded bg-butter px-sm py-xs text-cocoa opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      {t.caption}
                    </span>
                  </button>
                </Rise>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
