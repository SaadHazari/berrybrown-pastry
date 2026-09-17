import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { STATS } from '../../data/content';
import { media } from '../../data/media';
import { CountUp } from '../ui/CountUp';
import { Img } from '../ui/Img';
import { LoopVideo } from '../ui/LoopVideo';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { Heart } from '../ui/Squiggle';

export function Story() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 2]);
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const smallY = useTransform(scrollYProgress, [0, 1], [120, -80]);

  return (
    <section id="story" ref={ref} className="relative overflow-hidden py-16 md:py-32" aria-labelledby="story-title">
      <div className="container-x grid items-center gap-14 md:grid-cols-2 md:gap-20">
        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <motion.div className="polaroid relative z-10 w-[82%]" style={{ rotate, y }}>
            <span className="absolute -top-3 left-8 h-7 w-24 rotate-[-8deg] bg-sage/60" aria-hidden />
            <Img src={media.chef.src} alt={media.chef.alt} wrapperClassName="aspect-[4/5] rounded-[3px]" />
            <p className="mt-3 px-1 font-hand text-2xl text-milk">me, happiest with a piping bag</p>
          </motion.div>
          <motion.div className="absolute -bottom-6 right-0 z-20 w-[46%] overflow-hidden rounded-full border-[6px] border-cream shadow-lift" style={{ y: smallY }}>
            <LoopVideo video={media.craft.video} poster={media.craft.poster} className="aspect-square w-full object-cover" />
          </motion.div>
          <Heart className="absolute -left-2 top-10 z-20 size-10 rotate-[-15deg] text-berry" />
        </div>

        <div>
          <SectionHeading id="story-title" kicker="hi, I'm Safa" title="I bake the cakes I'd want at my own table." accent={['own', 'table.']} />
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-lg text-milk">
              Trained in pastry and years in a hotel kitchen taught me the craft. My mum's kitchen taught me the heart.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-6 font-hand text-4xl text-cocoa">— Safa</p>
          </Reveal>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-cocoa/10 pt-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-[clamp(2rem,5vw,3.2rem)] font-light leading-none">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
                <dt className="mt-2 text-sm text-milk">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
