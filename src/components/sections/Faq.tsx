import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { FAQS } from '../../data/content';
import { media } from '../../data/media';
import { cn } from '../../lib/cn';
import { ease } from '../../lib/motion';
import { Img } from '../ui/Img';
import { SectionHeading } from '../ui/SectionHeading';

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" className="relative py-16 md:py-28" aria-labelledby="faq-title">
      <div className="container-x grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <div>
          <SectionHeading id="faq-title" kicker="good to know" title="Little questions" accent={['questions']} />
          <div className="polaroid mt-10 hidden w-64 rotate-[-3deg] md:block">
            <Img src={media.gallery.coffee.src} alt={media.gallery.coffee.alt} wrapperClassName="aspect-square rounded-[3px]" />
            <p className="mt-3 px-1 font-hand text-xl text-milk">ask me anything, over coffee</p>
          </div>
        </div>

        <ul className="divide-y divide-cocoa/10 border-y border-cocoa/10">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <li key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={`${base}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${base}-a${i}`}
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className={cn('font-display text-xl transition-colors md:text-2xl', isOpen ? 'text-berry' : 'group-hover:text-berry')}>{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={cn('grid size-10 shrink-0 place-items-center rounded-full transition-colors', isOpen ? 'bg-berry text-cream' : 'bg-oat group-hover:bg-latte')}
                    >
                      <Plus className="size-5" />
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
                      <p className="max-w-xl pb-6 pr-12 text-milk">{f.a}</p>
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
