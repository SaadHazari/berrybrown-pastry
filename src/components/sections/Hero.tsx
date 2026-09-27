import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { RATING } from '../../data/content';
import { media } from '../../data/media';
import { ease } from '../../lib/motion';
import { useUI } from '../../store/ui';
import { Button, ButtonLink } from '../ui/Button';
import { Frame } from '../ui/Frame';
import { StarIcon } from '../ui/Icons';
import { Magnetic } from '../ui/Magnetic';
import { Parallax } from '../ui/Parallax';
import { Photo } from '../ui/Photo';

const AVATARS = [media.six[0], media.six[1], media.six[4]];

export function Hero() {
  const { open } = useUI();
  const reduce = useReducedMotion();
  const rise = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.1 + i * 0.06, ease: ease.out } };

  return (
    <section id="top" className="relative overflow-clip pb-3xl pt-xl lg:pt-2xl" aria-labelledby="hero-title">
      <div className="container-x grid items-center gap-2xl lg:grid-cols-12">
        <div className="lg:col-span-6">
          <motion.h1 id="hero-title" {...rise(0)} className="mx-auto w-[280px] md:w-[360px] lg:mx-0 lg:w-[440px]">
            <img src="/brand/berrybrown-logo-primary.svg" alt="Berry Brown — made with heart, not haste" width={396} height={329} className="h-auto w-full" />
          </motion.h1>
          <motion.p {...rise(1)} className="t-title3 mt-xl">
            A cake studio in Dubai.
          </motion.p>
          <motion.p {...rise(2)} className="t-body mt-sm max-w-[40ch] text-cocoa-70">
            Six signature cakes, custom cakes for the days that matter, and gift boxes and workshops for your team. All made to order.
          </motion.p>
          <motion.div {...rise(3)} className="mt-xl flex flex-col gap-sm sm:flex-row sm:items-center">
            <Magnetic className="block sm:inline-block">
              <Button variant="claret" onClick={() => open({ kind: 'menu' })} className="w-full sm:w-auto">
                Order a cake <ArrowRight className="size-[14px]" strokeWidth={1.75} aria-hidden />
              </Button>
            </Magnetic>
            <ButtonLink href="#custom" variant="ghost">
              Design your cake
            </ButtonLink>
          </motion.div>
          <motion.div {...rise(4)} className="mt-lg flex items-center gap-sm">
            <span className="flex -space-x-2" aria-hidden>
              {AVATARS.filter((m) => !m.placeholder).map((m) => (
                <img key={m.src} src={m.srcSet ? m.src.replace('-1200.', '-640.') : m.src} alt="" className="size-[32px] rounded-full object-cover ring-2 ring-butter" />
              ))}
            </span>
            <StarIcon className="size-[14px] text-cocoa" />
            <span className="t-price">
              {RATING.score} · {RATING.count}+ reviews
            </span>
          </motion.div>
        </div>

        <motion.div {...rise(3)} className="relative lg:col-span-6">
          <div aria-hidden className="absolute bottom-[4%] left-[14%] top-[8%] -right-md rounded bg-rose lg:-right-2xl" />
          <Parallax offset={24} className="relative ml-auto w-[88%] max-w-[460px]">
            <Frame caption={media.hero.cake.label} captionClassName="text-right">
              <Photo media={media.hero.cake} eager sizes="(min-width: 1024px) 460px, 88vw" />
            </Frame>
          </Parallax>
          <Parallax offset={60} rotate={-3} className="absolute -bottom-2xl left-0 w-[40%] max-w-[210px] lg:-left-md">
            <Frame>
              <Photo media={media.hero.slice} sizes="220px" />
            </Frame>
          </Parallax>
          <Parallax offset={-40} rotate={3} className="absolute -top-lg right-0 hidden w-[34%] max-w-[180px] md:block">
            <Frame>
              <Photo media={media.hero.hands} sizes="180px" />
            </Frame>
          </Parallax>
        </motion.div>
      </div>
    </section>
  );
}
