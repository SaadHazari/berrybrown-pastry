import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
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
import { IntroLogo, Tagline, useIntroTimeline } from './HeroIntro';

const AVATARS = [media.six[0], media.six[1], media.six[4]];

export function Hero() {
  const { open } = useUI();
  const reduce = useReducedMotion();
  const slot = useRef<HTMLHeadingElement>(null);
  useIntroTimeline();
  // The photos are the largest things on first load: they never start invisible, so the page paints them at once.
  const slide = (i: number) => (reduce ? {} : { initial: { y: 24 }, animate: { y: 0 }, transition: { duration: 0.9, delay: 0.1 + i * 0.06, ease: ease.out } });

  return (
    <section id="top" className="relative overflow-clip pb-3xl pt-lg lg:pt-xl" aria-labelledby="hero-title">
      <div className="container-x grid items-center gap-xl lg:grid-cols-12 lg:gap-2xl">
        <div className="lg:col-span-6">
          {/* Sized so each line stays on one line in the half-width column from 1024 px up. */}
          <h1 id="hero-title" ref={slot} className="t-display1 lg:text-[length:min(5.2vw,4.236rem)]">
            <span className="sr-only">Berry Brown — made with heart, not haste.</span>
            <Tagline />
          </h1>
          <IntroLogo slot={slot} />
          <p className="t-title3 mt-xl">A cake studio in Dubai.</p>
          <p className="t-body mt-sm max-w-[40ch] text-cocoa-70">
            Six signature cakes, custom cakes for the days that matter, and gift boxes and workshops for your team. All made to order.
          </p>
          <div className="mt-xl flex flex-col gap-sm sm:flex-row sm:items-center">
            <Magnetic className="block sm:inline-block">
              <Button variant="claret" onClick={() => open({ kind: 'menu' })} className="w-full sm:w-auto">
                Order a cake <ArrowRight className="size-[14px]" strokeWidth={1.75} aria-hidden />
              </Button>
            </Magnetic>
            <ButtonLink href="#custom" variant="ghost">
              Design your cake
            </ButtonLink>
          </div>
          <div className="mt-lg flex items-center gap-sm">
            <span className="flex -space-x-2" aria-hidden>
              {AVATARS.filter((m) => !m.placeholder).map((m) => (
                <img key={m.src} src={m.srcSet ? m.src.replace('-1200.', '-640.') : m.src} alt="" className="size-[32px] rounded-full object-cover ring-2 ring-butter" />
              ))}
            </span>
            <StarIcon className="size-[14px] text-cocoa" />
            <span className="t-price">
              {RATING.score} · {RATING.count}+ reviews
            </span>
          </div>
        </div>

        <motion.div {...slide(3)} className="relative lg:col-span-6">
          <div aria-hidden className="absolute bottom-[4%] left-[14%] top-[8%] -right-md rounded bg-rose lg:-right-2xl" />
          {/* On laptops the main photo also shrinks with the window height, so it fits the first screen. */}
          <Parallax offset={24} className="relative ml-auto w-[88%] max-w-[460px] lg:max-w-[min(460px,calc((100svh-210px)*0.8))]">
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
