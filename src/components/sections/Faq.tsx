import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { FAQS } from '../../data/content';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { ease, spring } from '../../lib/motion';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Photo } from '../ui/Photo';

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" className="section-more" aria-labelledby="faq-title">
      <div className="container-x grid gap-2xl md:grid-cols-[0.8fr_1.2fr] md:gap-3xl">
        <div>
          <Heading id="faq-title" label="Good to know" title="Little questions." />
          <Frame caption={media.faq.label} tilt={-3} className="mt-xl hidden w-[16rem] md:block">
            <Photo media={media.faq} sizes="260px" />
          </Frame>
        </div>
        <ul className="border-y border-cocoa-15">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <li key={f.q} className="border-b border-cocoa-15 last:border-b-0">
                <h3>
                  <button
                    type="button"
                    id={`${base}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${base}-a${i}`}
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="group flex min-h-[56px] w-full items-center justify-between gap-lg py-md text-left"
                  >
                    <span className={cn('t-title3 transition-colors', isOpen ? 'text-claret' : 'group-hover:text-cocoa-70')}>{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={spring.snappy}
                      className={cn('grid size-[40px] shrink-0 place-items-center rounded-full border transition-colors', isOpen ? 'border-cocoa bg-cocoa text-butter' : 'border-cocoa-15')}
                    >
                      <Plus className="size-[16px]" aria-hidden />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${base}-a${i}`}
                      role="region"
                      aria-labelledby={`${base}-q${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: ease.out }}
                      className="overflow-hidden"
                    >
                      <p className="t-body max-w-[60ch] pb-lg pr-2xl text-cocoa-70">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
