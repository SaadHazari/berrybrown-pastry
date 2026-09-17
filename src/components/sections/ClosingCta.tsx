import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { media } from '../../data/media';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Magnetic } from '../ui/Magnetic';
import { SplitWords } from '../ui/SplitWords';

const STACK = [
  { m: media.products.chocolateDrip, cls: 'left-[2%] top-[8%] w-[30%] md:w-[18%]', r: -8, speed: 80 },
  { m: media.products.mangoTart, cls: 'right-[3%] top-[4%] w-[28%] md:w-[16%]', r: 7, speed: 140 },
  { m: media.gallery.pistachioSlice, cls: 'left-[8%] bottom-[2%] hidden md:block md:w-[14%]', r: 5, speed: 40 },
  { m: media.products.creamSponge, cls: 'right-[8%] bottom-[4%] hidden md:block md:w-[17%]', r: -5, speed: 110 },
];

function Floating({ s, progress }: { s: (typeof STACK)[number]; progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], [s.speed, -s.speed]);
  return (
    <motion.div className={`polaroid absolute ${s.cls}`} style={{ y, rotate: s.r }} aria-hidden>
      <img src={s.m.src} alt="" loading="lazy" className="aspect-square w-full rounded-[3px] object-cover" />
    </motion.div>
  );
}

export function ClosingCta() {
  const { open } = useUI();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  return (
    <section ref={ref} className="relative overflow-hidden py-28 md:py-44" aria-labelledby="cta-title">
      {STACK.map((s) => (
        <Floating key={s.m.src} s={s} progress={scrollYProgress} />
      ))}
      <div className="container-x relative text-center">
        <p className="font-hand text-2xl text-berry md:text-3xl">your next celebration starts here</p>
        <h2 id="cta-title" className="mx-auto mt-3 max-w-3xl text-[clamp(2.6rem,8vw,6rem)] font-light leading-[0.95]">
          <SplitWords text="Let's bake something lovely." inView accent={['lovely.']} />
        </h2>
        <div className="mt-10 flex justify-center">
          <Magnetic>
            <Button size="lg" onClick={() => open({ kind: 'menu' })}>
              Order a cake <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
