import { motion } from 'motion/react';
import { STEPS } from '../../data/content';
import { useIsWide } from '../../lib/hooks';
import { ease } from '../../lib/motion';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Photo } from '../ui/Photo';
import { Rise } from '../ui/Rise';

const TILTS = [-2, 1.5, -1];

/** A hand-drawn arrow that draws itself once it scrolls into view. */
function Arrow() {
  return (
    <svg viewBox="0 0 120 40" className="h-[32px] w-[96px] text-cocoa-70" fill="none" aria-hidden>
      <motion.path
        d="M4 28 C 30 6, 70 6, 104 20 M 94 10 L 106 21 L 92 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.4, ease: ease.smooth }}
      />
    </svg>
  );
}

export function HowItWorks() {
  const wide = useIsWide();
  return (
    <section id="how" className="section-more" aria-labelledby="how-title">
      <div className="container-x">
        <Heading id="how-title" label="How it works" title="How ordering works." align="center" />
        {wide ? (
          <ol className="mt-2xl grid grid-cols-3 gap-xl">
            {STEPS.map((s, i) => (
              <Rise as="li" key={s.n} delay={i * 0.15} className="relative">
                <Frame caption={`Step ${i + 1}`} tilt={TILTS[i]}>
                  <Photo media={s.image} ratio="4 / 3" sizes="380px" />
                </Frame>
                <div className="mt-lg flex items-baseline gap-sm">
                  <span className="font-label text-[2.618rem] leading-none text-claret">{s.n}</span>
                  <h3 className="t-title3">{s.title}</h3>
                </div>
                <p className="t-callout mt-xs text-cocoa-70">{s.text}</p>
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-xl top-1/3 z-10">
                    <Arrow />
                  </div>
                )}
              </Rise>
            ))}
          </ol>
        ) : (
          <ol className="mt-xl">
            {STEPS.map((s, i) => (
              <li key={s.n} className="sticky pb-md" style={{ top: `${72 + i * 18}px` }}>
                <motion.div
                  className="overflow-hidden rounded border border-cocoa-15 bg-butter shadow-frame"
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.7, ease: ease.out }}
                >
                  <Photo media={s.image} ratio="16 / 10" className="rounded-none!" sizes="100vw" />
                  <div className="flex items-start gap-md p-md">
                    <span className="font-label text-[2.058rem] leading-none text-claret">{s.n}</span>
                    <div>
                      <h3 className="t-heading">{s.title}</h3>
                      <p className="t-callout mt-2xs text-cocoa-70">{s.text}</p>
                    </div>
                  </div>
                </motion.div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
