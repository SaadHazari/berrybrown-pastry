import { AnimatePresence, motion } from 'motion/react';
import { CONTACT } from '../../../data/content';
import { customSummary, ticketImage, type CustomForm, type StepId } from '../../../data/custom';
import { aed, prettyDate } from '../../../lib/format';
import { Button } from '../../ui/Button';
import { Photo } from '../../ui/Photo';

type Props = { form: CustomForm; price: number; left: number; busy: boolean; note: string; emailHref: string; onSend(): void; onEdit(step: StepId): void };

/** "Your cake": the look's photo, the answers (each jumps back to its step), the from-price and the Claret send. */
export function Ticket({ form, price, left, busy, note, emailHref, onSend, onEdit }: Props) {
  const image = ticketImage(form);
  return (
    <div className="rounded border border-cocoa-15 bg-butter p-md">
      <div className="relative overflow-hidden rounded">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={image.src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <Photo media={image} ratio="4 / 3" sizes="440px" />
          </motion.div>
        </AnimatePresence>
      </div>
      <h3 className="t-title3 mt-md">Your cake</h3>
      <ul className="mt-sm border-t border-cocoa-15">
        {customSummary(form).map((r) => (
          <li key={r.step} className="border-b border-cocoa-15">
            <button type="button" onClick={() => onEdit(r.step)} className="flex w-full items-baseline justify-between gap-md py-xs text-left transition-colors hover:bg-cocoa/4">
              <span className="t-label text-cocoa-70">
                <span className="sr-only">Change </span>
                {r.label}
              </span>
              <span className="t-callout min-w-0 truncate text-right">{r.step === 'date' && r.value ? prettyDate(r.value) : r.value || '—'}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="t-price mt-md text-[1.2rem]">From {aed(price)}</p>
      <p className="t-caption mt-2xs text-cocoa-70">Final price on WhatsApp. A 50% deposit books your date.</p>
      <Button variant="claret" className="mt-md w-full" onClick={onSend} disabled={busy || left > 0}>
        {busy ? 'Uploading photos…' : left > 0 ? `Answer ${left} more` : 'Send on WhatsApp'}
      </Button>
      <a href={emailHref} className="t-callout link mt-sm block text-center">
        or email {CONTACT.email}
      </a>
      {note && (
        <p className="t-caption mt-sm text-cocoa-70" aria-live="polite">
          {note}
        </p>
      )}
    </div>
  );
}
