import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CUSTOMISED,
  CUSTOM_STEPS,
  EMPTY_CUSTOM,
  FLAVOURS,
  IDEA_MAX,
  LOOKS,
  OCCASIONS,
  OTHER_MAX,
  SIZES,
  WORDS_MAX,
  customAnswers,
  customFromPrice,
  customSummary,
  earliestCustomDate,
  isStepDone,
  remaining,
  validateCustom,
  type CustomForm,
  type StepId,
} from '../../../data/custom';
import { recordEnquiry, uploadInspiration } from '../../../lib/api';
import { cn } from '../../../lib/cn';
import { aed, prettyDate } from '../../../lib/format';
import { ease } from '../../../lib/motion';
import { customCakeMessage, mailtoLink, whatsappLink } from '../../../lib/order';
import { useCart } from '../../../store/cart';
import { Button } from '../../ui/Button';
import { Heading } from '../../ui/Heading';
import { Options } from './Options';
import { Progress } from './Progress';
import { Ticket } from './Ticket';
import { Upload, addShots, type Shot } from './Upload';

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -24 }),
};

type PickKey = 'occasion' | 'serves' | 'look' | 'flavour';
type OtherKey = 'occasionOther' | 'servesOther' | 'lookOther' | 'flavourOther';

export function CustomCake() {
  const { count } = useCart();
  const [form, setForm] = useState<CustomForm>(EMPTY_CUSTOM);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [shots, setShots] = useState<Shot[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const earliest = useMemo(() => earliestCustomDate(), []);
  const moved = useRef(false);
  const timer = useRef(0);
  const shotsRef = useRef(shots);
  shotsRef.current = shots;

  const current = CUSTOM_STEPS[step];
  const left = remaining(form, earliest);
  const price = customFromPrice(form);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      shotsRef.current.forEach((s) => s.preview && URL.revokeObjectURL(s.preview));
    },
    [],
  );
  // The next question mounts only after the old one has faded out (AnimatePresence "wait"),
  // so focus it when it mounts rather than when `step` changes.
  const focusQuestion = useCallback((el: HTMLHeadingElement | null) => {
    if (el && moved.current) el.focus({ preventScroll: true });
  }, []);

  const set = <K extends keyof CustomForm>(k: K, v: CustomForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setNote('');
  };

  const go = (to: number) => {
    if (to < 0 || to >= CUSTOM_STEPS.length || to === step) return;
    window.clearTimeout(timer.current);
    setDir(to > step ? 1 : -1);
    moved.current = true;
    setStep(to);
  };

  const pick = (k: PickKey, id: string) => {
    set(k, id);
    window.clearTimeout(timer.current);
    if (id !== CUSTOMISED) timer.current = window.setTimeout(() => go(step + 1), 250);
  };

  const other = (k: OtherKey, placeholder: string, max = OTHER_MAX) => ({ value: form[k], onChange: (v: string) => set(k, v), placeholder, max });

  const onAdd = (files: File[]) => {
    const r = addShots(shots, files);
    setShots(r.shots);
    setPhotoError(r.error);
  };
  const onRemove = (id: string) => {
    setShots((list) => {
      const gone = list.find((s) => s.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return list.filter((s) => s.id !== id);
    });
    setPhotoError('');
  };

  const send = async () => {
    if (Object.keys(validateCustom(form, earliest)).length) {
      const first = CUSTOM_STEPS.findIndex((s) => !isStepDone(s.id, form, earliest));
      if (first >= 0) go(first);
      setNote('One answer is missing. We took you to it.');
      return;
    }
    // Open the tab inside the click, fill it after the upload — Safari blocks window.open after an await.
    let popup: Window | null = null;
    if (shots.length) {
      popup = window.open('', '_blank');
      if (popup) popup.opener = null;
      setBusy(true);
    }
    let urls: string[] = [];
    let unsent = 0;
    if (shots.length) {
      try {
        urls = await uploadInspiration(shots.map((s) => s.file));
      } catch {
        unsent = shots.length;
      }
    }
    const message = customCakeMessage(form, urls, unsent);
    const link = whatsappLink(message);
    recordEnquiry({ kind: 'custom', answers: customAnswers(form), fromPrice: price, photos: urls, message });
    if (popup) popup.location.href = link;
    else if (shots.length) window.location.assign(link);
    else window.open(link, '_blank', 'noopener,noreferrer');
    setBusy(false);
    setNote(unsent ? 'The photos did not upload. Please attach them in WhatsApp.' : 'Your message is ready in WhatsApp.');
  };

  const body = () => {
    switch (current.id) {
      case 'occasion':
        return <Options label={current.question} options={OCCASIONS} value={form.occasion} onPick={(id) => pick('occasion', id)} other={other('occasionOther', 'Tell us the occasion')} />;
      case 'serves':
        return <Options label={current.question} options={SIZES} value={form.serves} onPick={(id) => pick('serves', id)} other={other('servesOther', 'Tell us how many people')} />;
      case 'look':
        return (
          <>
            <Options label={current.question} options={LOOKS} value={form.look} onPick={(id) => pick('look', id)} other={other('lookOther', 'Describe your idea', IDEA_MAX)} withImages />
            <Upload shots={shots} error={photoError} onAdd={onAdd} onRemove={onRemove} />
          </>
        );
      case 'flavour':
        return (
          <>
            <Options label={current.question} options={FLAVOURS} value={form.flavour} onPick={(id) => pick('flavour', id)} other={other('flavourOther', 'Tell us the flavour')} />
            <p className="t-caption mt-sm text-cocoa-70">A custom flavour adds AED 60.</p>
          </>
        );
      case 'words':
        return (
          <div>
            <input className="field" maxLength={WORDS_MAX} value={form.words} disabled={form.noWords} onChange={(e) => set('words', e.target.value)} placeholder="For example: Happy 60th, Dad" aria-label="Words on the cake" autoComplete="off" />
            <div className="mt-sm flex items-center justify-between gap-md">
              <button
                type="button"
                aria-pressed={form.noWords}
                onClick={() => {
                  const on = !form.noWords;
                  set('noWords', on);
                  if (on) set('words', '');
                }}
                className={cn('chip', form.noWords && 'chip-on')}
              >
                No words
              </button>
              <span className="t-price-sm text-cocoa-70" aria-live="polite">
                {form.words.length}/{WORDS_MAX}
              </span>
            </div>
          </div>
        );
      case 'date':
        return (
          <div>
            <input type="date" className="field max-w-[18rem]" min={earliest} value={form.date} onChange={(e) => set('date', e.target.value)} aria-label="Date of the celebration" />
            <p className="t-caption mt-sm text-cocoa-70">We need a week for custom cakes. We make only two a week, so book early.</p>
            {form.date !== '' && form.date < earliest && (
              <p role="alert" className="t-caption mt-xs text-cocoa">
                The earliest date is {prettyDate(earliest)}.
              </p>
            )}
          </div>
        );
    }
  };

  const strip = [`From ${aed(price)}`, customSummary(form)[0].value, SIZES.find((s) => s.id === form.serves)?.size].filter(Boolean).join(' · ');
  const edit = (s: StepId) => go(CUSTOM_STEPS.findIndex((x) => x.id === s));

  return (
    <section id="custom" className="section-more bg-rose" aria-labelledby="custom-title">
      <div className="container-x">
        <Heading id="custom-title" tone="rose" label="Custom cakes" title="Design your cake." oneliner="Six quick questions. We reply on WhatsApp with the price." />

        {/* One ticket: the questions and "Your cake" are two halves of one card, split by a dashed line like a tear-off
            stub. They share both edges, so nothing pins or slides, and Next and Send sit on one bottom line. */}
        <div className="mt-xl rounded border border-cocoa-15 bg-butter lg:grid lg:grid-cols-12">
          <div data-pane="steps" className="flex flex-col p-md md:p-xl lg:col-span-7">
            <Progress step={step} form={form} earliest={earliest} onJump={go} />
            <p className="sr-only" aria-live="polite">
              Step {step + 1} of {CUSTOM_STEPS.length}
            </p>
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={current.id} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: ease.out }} className="pb-xl">
                <h3 ref={focusQuestion} tabIndex={-1} className="t-title2 mt-lg outline-none">
                  {current.question}
                </h3>
                <div className="mt-lg">{body()}</div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-auto flex items-center justify-between gap-md border-t border-cocoa-15 pt-md">
              <button type="button" onClick={() => go(step - 1)} className={cn('t-label link py-sm', step === 0 && 'invisible')}>
                ← Back
              </button>
              {step < CUSTOM_STEPS.length - 1 ? (
                <Button variant="cocoa" onClick={() => go(step + 1)} disabled={!isStepDone(current.id, form, earliest)}>
                  Next
                </Button>
              ) : (
                <span className="t-label text-cocoa-70">{left > 0 ? `${left} left to answer` : 'All answered'}</span>
              )}
            </div>
          </div>

          <aside data-pane="ticket" className="hidden border-l border-dashed border-cocoa-15 p-xl lg:col-span-5 lg:flex lg:flex-col" aria-label="Your cake">
            <Ticket form={form} price={price} left={left} busy={busy} note={note} emailHref={mailtoLink('Custom cake', customCakeMessage(form))} onSend={send} onEdit={edit} />
          </aside>
        </div>

        {/* Below 1024 px the ticket becomes a bar pinned to the bottom of the section. */}
        <div className={cn('sticky z-30 -mx-md mt-xl border-t border-cocoa-15 bg-butter/95 px-md pt-sm pb-safe backdrop-blur-[8px] lg:hidden', count > 0 ? 'bottom-[72px] md:bottom-0' : 'bottom-0')}>
          <div className="flex items-center gap-md">
            <p className="t-price min-w-0 flex-1 truncate">{left > 0 ? `Step ${step + 1} of ${CUSTOM_STEPS.length} · From ${aed(price)}` : strip}</p>
            <Button variant="claret" className="shrink-0" onClick={send} disabled={busy || left > 0}>
              {busy ? 'Uploading…' : 'Send'}
            </Button>
          </div>
          {note && (
            <p className="t-caption mt-xs text-cocoa-70" aria-live="polite">
              {note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
