import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { media, type Media } from '../../data/media';
import { cn } from '../../lib/cn';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Frame } from '../ui/Frame';
import { Magnetic } from '../ui/Magnetic';
import { Photo } from '../ui/Photo';
import { SplitWords } from '../ui/SplitWords';

type Card = { m: Media; cls: string; r: number; speed: number };

const CARDS: Card[] = [
  { m: media.six[0], cls: 'left-[2%] top-[4%] w-[26%] md:w-[15%]', r: -8, speed: 80 },
  { m: media.six[1], cls: 'right-[3%] top-[2%] w-[24%] md:w-[13%]', r: 7, speed: 140 },
  { m: media.six[2], cls: 'left-[7%] bottom-[4%] hidden md:block md:w-[12%]', r: 5, speed: 40 },
  { m: media.six[4], cls: 'right-[8%] bottom-[6%] hidden md:block md:w-[14%]', r: -5, speed: 110 },
];

function Floating({ card, progress }: { card: Card; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [card.speed, -card.speed]);
  return (
    <motion.div className={cn('absolute', card.cls)} style={reduce ? { rotate: card.r } : { y, rotate: card.r }} aria-hidden>
      <Frame>
        <Photo media={card.m} ratio="1 / 1" sizes="220px" />
      </Frame>
    </motion.div>
  );
}

export function Closing() {
  const { open } = useUI();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  return (
    <section ref={ref} className="section-most relative overflow-clip" aria-labelledby="closing-title">
      {CARDS.map((c) => (
        <Floating key={c.m.src} card={c} progress={scrollYProgress} />
      ))}
      <div className="container-x relative flex flex-col items-center pt-2xl text-center md:pt-0">
        <p className="t-label text-cocoa-70">Your next celebration starts here</p>
        <h2 id="closing-title" className="t-display1 mt-md max-w-[14ch]">
          <SplitWords text="Let's bake something lovely." accent={['lovely.']} />
        </h2>
        <Magnetic className="mt-xl inline-block">
          <Button variant="claret" onClick={() => open({ kind: 'menu' })}>
            Order a cake
          </Button>
        </Magnetic>
      </div>
    </section>
  );
}
