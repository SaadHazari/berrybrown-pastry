import { AnimatePresence, motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BUILDER_GROUPS, BUILDER_IMAGE, DEFAULT_SELECTION, describe, estimate, type BuilderSelection } from '../../data/builder';
import { cn } from '../../lib/cn';
import { spring } from '../../lib/motion';
import { whatsappLink } from '../../lib/order';
import { AnimatedAED } from '../ui/AnimatedNumber';
import { ButtonLink } from '../ui/Button';
import { Img } from '../ui/Img';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { WhatsAppIcon } from '../layout/WhatsAppFab';

export function Builder() {
  const [sel, setSel] = useState<BuilderSelection>(DEFAULT_SELECTION);
  const [date, setDate] = useState('');
  const range = useMemo(() => estimate(sel), [sel]);

  const message = useMemo(
    () =>
      [
        "Hi Safa! I'd love a custom cake 🎂",
        '',
        ...describe(sel).map((l) => `• ${l}`),
        date ? `• Date: ${date}` : '',
        `• Estimate on the site: AED ${range.min}–${range.max}`,
      ]
        .filter(Boolean)
        .join('\n'),
    [sel, date, range],
  );

  return (
    <section id="custom" className="relative px-2 py-8 md:px-3 md:py-12" aria-labelledby="custom-title">
      <div className="relative overflow-hidden rounded-[36px] bg-oat py-14 md:rounded-[56px] md:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-blush/70 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-sage-soft blur-3xl" />

        <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-16">
          <div>
            <SectionHeading id="custom-title" kicker="dreaming of something special?" title="Design your own cake" accent={['own']} />
            <p className="mt-4 max-w-md text-milk">Tap your picks. Safa will reply on WhatsApp with ideas and an exact price.</p>

            <div className="mt-10 space-y-8">
              {BUILDER_GROUPS.map((g, gi) => (
                <Reveal key={g.id} delay={gi * 0.06}>
                  <fieldset>
                    <legend className="mb-3 flex items-center gap-2 font-display text-xl">
                      <span className="grid size-7 place-items-center rounded-full bg-cocoa text-xs font-sans font-semibold text-cream">{gi + 1}</span>
                      {g.title}
                    </legend>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={g.title}>
                      {g.options.map((o) => {
                        const active = sel[g.id] === o.id;
                        return (
                          <motion.button
                            key={o.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setSel((s) => ({ ...s, [g.id]: o.id }))}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'relative flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors duration-300',
                              active ? 'bg-cocoa text-cream shadow-soft' : 'bg-paper/80 text-cocoa hover:bg-paper',
                            )}
                          >
                            {o.emoji && <span className="text-lg">{o.emoji}</span>}
                            <span>
                              {o.label}
                              {o.hint && <span className={cn('block text-xs font-normal', active ? 'text-cream/70' : 'text-milk')}>{o.hint}</span>}
                            </span>
                            <AnimatePresence>
                              {active && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring.bouncy} className="grid size-5 place-items-center rounded-full bg-berry">
                                  <Check className="size-3" strokeWidth={3} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      })}
                    </div>
                  </fieldset>
                </Reveal>
              ))}

              <Reveal>
                <label className="block max-w-xs">
                  <span className="mb-3 flex items-center gap-2 font-display text-xl">
                    <span className="grid size-7 place-items-center rounded-full bg-cocoa text-xs font-sans font-semibold text-cream">5</span>
                    When's the party?
                  </span>
                  <input name="party-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 w-full rounded-2xl bg-paper/80 px-4 text-cocoa outline-none ring-berry focus:ring-2" />
                </label>
              </Reveal>
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div layout className="overflow-hidden rounded-[32px] bg-paper shadow-lift">
              <div className="relative">
                <Img src={BUILDER_IMAGE.src} alt={BUILDER_IMAGE.alt} wrapperClassName="aspect-[5/4]" />
                <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-paper/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  <Sparkles className="size-3.5 text-berry" /> Your cake
                </span>
              </div>
              <div className="p-6">
                <ul className="space-y-1.5 text-sm text-milk">
                  <AnimatePresence initial={false} mode="popLayout">
                    {describe(sel).map((line) => (
                      <motion.li key={line} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-sage" /> {line}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="mt-5 rounded-2xl bg-cream p-4">
                  <p className="text-xs text-milk">Estimated price</p>
                  <p className="font-display text-3xl">
                    <AnimatedAED value={range.min} /> <span className="text-milk">–</span> <AnimatedAED value={range.max} />
                  </p>
                  <p className="mt-1 text-xs text-milk">Final quote from Safa · 48h+ notice</p>
                </div>
                <ButtonLink href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" size="lg" className="mt-5 w-full">
                  <WhatsAppIcon className="size-5" />
                  Send my idea to Safa
                </ButtonLink>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
