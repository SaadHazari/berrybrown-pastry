import { useId, useState } from 'react';
import { FAQS } from '../../data/content';
import { cn } from '../../lib/cn';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" className="section-more" aria-labelledby="faq-title">
      <Reveal className="container-x grid gap-xl lg:grid-cols-12 lg:gap-2xl">
        <div className="lg:col-span-4">
          <SectionHeading id="faq-title" title="Little questions" oneliner="What people ask before they order." />
        </div>
        <ul className="border-t border-cocoa-15 lg:col-span-8" role="list">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <li key={f.q} className="border-b border-cocoa-15">
                <h3>
                  <button
                    type="button"
                    id={`${base}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${base}-a${i}`}
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="flex min-h-[56px] w-full items-center justify-between gap-md py-sm text-left"
                  >
                    <span className="t-heading">{f.q}</span>
                    <span className={cn('t-price shrink-0 text-[1.2rem] leading-none', isOpen ? 'text-claret' : 'text-cocoa-70')} aria-hidden>
                      {isOpen ? '×' : '+'}
                    </span>
                  </button>
                </h3>
                {isOpen && (
                  <div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`}>
                    <p className="t-body max-w-[60ch] pb-lg text-cocoa-70">{f.a}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
