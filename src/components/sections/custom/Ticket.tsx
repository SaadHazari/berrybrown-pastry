import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { CONTACT } from '../../../data/content';
import { customSummary, ticketImage, type CustomForm, type StepId } from '../../../data/custom';
import { aed, prettyDate } from '../../../lib/format';
import { Button } from '../../ui/Button';
import { Photo } from '../../ui/Photo';

type Props = { form: CustomForm; price: number; left: number; busy: boolean; note: string; emailHref: string; onSend(): void; onEdit(step: StepId): void };

/** One answer. It glows Rose for a moment when it changes, so the visitor sees the answer land. */
function Row({ step, label, value, onEdit }: { step: StepId; label: string; value: string; onEdit(step: StepId): void }) {
  const ref = useRef<HTMLLIElement>(null);
  const last = useRef(value);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (last.current === value) return;
    last.current = value;
    if (reduce || !ref.current) return;
    const glow = animate(ref.current, { backgroundColor: ['rgba(231, 207, 198, 0.9)', 'rgba(231, 207, 198, 0)'] }, { duration: 1.2, ease: 'easeOut' });
    return () => glow.stop();
  }, [value, reduce]);

  return (
    <li ref={ref} className="border-b border-cocoa-15">
      <button type="button" onClick={() => onEdit(step)} className="flex w-full items-baseline justify-between gap-md py-2xs text-left transition-colors hover:bg-cocoa/4">
        <span className="t-label text-cocoa-70">
          <span className="sr-only">Change </span>
          {label}
        </span>
        <span className="t-callout min-w-0 truncate text-right">{value || '—'}</span>
      </button>
    </li>
  );
}

/**
 * "Your cake": the right half of the one ticket. The look's photo (a sprig until one is picked), the answers (each jumps
 * back to its step), the from-price, and Send on the bottom line — quiet until all six are answered, then Claret.
 */
export function Ticket({ form, price, left, busy, note, emailHref, onSend, onEdit }: Props) {
  const image = ticketImage(form);
  const ready = left === 0;
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-md">
        <div className="relative size-[var(--spacing-3xl)] shrink-0 overflow-hidden rounded bg-rose">
          <AnimatePresence initial={false}>
            <motion.div key={image?.src ?? 'none'} className="absolute inset-0 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              {image ? <Photo media={image} ratio="1 / 1" sizes="123px" className="size-full" /> : <img src="/brand/berrybrown-sprig.svg" alt="" width={144} height={166} className="h-[62%] w-auto opacity-80" />}
            </motion.div>
          </AnimatePresence>
        </div>
        <div>
          <h3 className="t-title3">Your cake</h3>
          <p className="t-caption mt-2xs text-cocoa-70">It fills in as you answer.</p>
        </div>
      </div>

      <ul className="mt-md border-t border-cocoa-15">
        {customSummary(form).map((r) => (
          <Row key={r.step} step={r.step} label={r.label} value={r.step === 'date' && r.value ? prettyDate(r.value) : r.value} onEdit={onEdit} />
        ))}
      </ul>

      <div className="mt-auto pt-md">
        <p className="t-price text-[1.2rem]">From {aed(price)}</p>
        <p className="t-caption mt-2xs text-cocoa-70">Final price on WhatsApp. A 50% deposit books your date.</p>
        <a href={emailHref} className="t-callout link mt-xs inline-block">
          or email {CONTACT.email}
        </a>
        {note && (
          <p className="t-caption mt-xs text-cocoa-70" aria-live="polite">
            {note}
          </p>
        )}
        <div className="mt-md border-t border-cocoa-15 pt-md">
          <Button data-send variant={ready ? 'claret' : 'ghost'} className="w-full" onClick={onSend} disabled={busy || !ready}>
            {busy ? 'Uploading photos…' : 'Send on WhatsApp'}
          </Button>
        </div>
      </div>
    </div>
  );
}
