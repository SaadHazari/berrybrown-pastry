import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cakeNumber } from '../../data/content';
import { cn } from '../../lib/cn';
import { useLog } from '../../lib/live';
import { ease } from '../../lib/motion';
import { Photo } from '../ui/Photo';

/** The cake log, folded shut above the footer. One tap opens the newest numbered cakes. */
export function CakeLog() {
  const log = useLog();
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section id="log" className="pb-2xl" aria-labelledby={`${id}-t`}>
      <div className="container-x">
        <div className="border-y border-cocoa-15">
          <div className="flex flex-col gap-sm py-lg md:flex-row md:items-center md:gap-lg">
            <h2 id={`${id}-t`} className="t-label shrink-0 text-cocoa-70">
              The cake log
            </h2>
            <p className="t-body flex-1">
              Every cake we make gets a number. The latest is <span className="font-label text-claret">{cakeNumber(log[0].n)}</span>.
            </p>
            <button type="button" aria-expanded={open} aria-controls={`${id}-p`} onClick={() => setOpen((v) => !v)} className="btn btn-ghost self-start md:self-auto">
              {open ? 'Close the log' : 'Open the log'}
              <ChevronDown className={cn('size-[14px] transition-transform duration-300', open && 'rotate-180')} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div id={`${id}-p`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: ease.out }} className="overflow-hidden">
                <ul className="grid gap-lg pb-xl sm:grid-cols-3">
                  {log.slice(0, 3).map((l) => (
                    <li key={l.n}>
                      <figure>
                        <Photo media={l.image} sizes="(min-width: 640px) 30vw, 90vw" />
                        <figcaption className="mt-sm flex items-baseline gap-sm">
                          <span className="t-price text-claret">{cakeNumber(l.n)}</span>
                          <span className="t-caption text-cocoa-70">
                            {l.for} · {l.flavour}, {l.size}
                          </span>
                        </figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
