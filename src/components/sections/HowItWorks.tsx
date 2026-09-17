import { motion } from 'motion/react';
import { STEPS } from '../../data/content';
import { useIsDesktop } from '../../lib/hooks';
import { ease } from '../../lib/motion';
import { Img } from '../ui/Img';
import { SectionHeading } from '../ui/SectionHeading';

function Arrow() {
  return (
    <svg viewBox="0 0 120 40" className="h-8 w-24 text-berry/60" fill="none" aria-hidden>
      <motion.path
        d="M4 28 C 30 6, 70 6, 104 20 M 94 10 L 106 21 L 92 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: ease.smooth, delay: 0.4 }}
      />
    </svg>
  );
}

export function HowItWorks() {
  const isDesktop = useIsDesktop();
  return (
    <section id="how" className="relative py-16 md:py-28" aria-labelledby="how-title">
      <div className="container-x">
        <SectionHeading id="how-title" kicker="easy as pie" title="How ordering works" accent={['works']} align="center" />

        {isDesktop ? (
          <ol className="mt-16 grid grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.n}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: ease.out }}
              >
                <div className="polaroid" style={{ transform: `rotate(${[-2, 1.5, -1][i]}deg)` }}>
                  <Img src={s.image.src} alt={s.image.alt} wrapperClassName="aspect-[4/3] rounded-[3px]" />
                  <p className="mt-3 px-1 font-hand text-xl text-milk">step {i + 1}</p>
                </div>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-display text-5xl font-light italic text-berry">{s.n}</span>
                  <h3 className="font-display text-2xl">{s.title}</h3>
                </div>
                <p className="mt-2 text-milk">{s.text}</p>
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-10 top-1/3 z-10">
                    <Arrow />
                  </div>
                )}
              </motion.li>
            ))}
          </ol>
        ) : (
          <ol className="mt-10">
            {STEPS.map((s, i) => (
              <li key={s.n} className="sticky pb-6" style={{ top: `${96 + i * 18}px` }}>
                <motion.div
                  className="overflow-hidden rounded-[28px] bg-paper shadow-lift ring-1 ring-cocoa/5"
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.7, ease: ease.out }}
                >
                  <Img src={s.image.src} alt={s.image.alt} wrapperClassName="aspect-[16/10]" />
                  <div className="flex items-start gap-4 p-5">
                    <span className="font-display text-4xl font-light italic leading-none text-berry">{s.n}</span>
                    <div>
                      <h3 className="font-display text-xl">{s.title}</h3>
                      <p className="mt-1 text-sm text-milk">{s.text}</p>
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
