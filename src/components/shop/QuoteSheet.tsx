import { useEffect, useState } from 'react';
import { BOX, EVENTS, QUOTE_INFO, WORKSHOP, isQuoteAbout, type QuoteAbout } from '../../data/companies';
import { EMPTY_QUOTE, earliestQuoteDate, quoteAnswers, validateQuote, type QuoteErrors, type QuoteForm } from '../../data/quote';
import { recordEnquiry } from '../../lib/api';
import { mailtoLink, quoteMessage, whatsappLink } from '../../lib/order';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { ChoiceField, TextField } from '../ui/Field';
import { Sheet } from '../ui/Sheet';

type Format = QuoteForm['format'];

function QuoteBody({ about, format }: { about: QuoteAbout; format?: Format }) {
  const [form, setForm] = useState<QuoteForm>({ ...EMPTY_QUOTE, format: format ?? '' });
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [note, setNote] = useState('');
  const info = QUOTE_INFO[about];

  const set = <K extends keyof QuoteForm>(k: K, v: QuoteForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setNote('');
  };

  const submit = (via: 'whatsapp' | 'email') => {
    const e = validateQuote(about, form);
    setErrors(e);
    if (Object.keys(e).length) {
      setNote('Please check the marked answers.');
      return;
    }
    const message = quoteMessage(about, form);
    recordEnquiry({ kind: 'company', about, answers: quoteAnswers(form), message });
    if (via === 'whatsapp') {
      window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
      setNote('Your message is ready in WhatsApp.');
    } else {
      window.location.href = mailtoLink(`${info.subject} quote`, message);
      setNote('Your email is ready to send.');
    }
  };

  return (
    <div className="px-md py-lg md:px-lg">
      <p className="t-price">{info.price}</p>
      <p className="t-label mt-xs text-cocoa-70">{info.facts.join(' · ')}</p>
      <div className="mt-xl space-y-lg">
        {about === 'event' && (
          <ChoiceField label="Which one?" value={form.format} options={EVENTS.formats.map((f) => ({ id: f.id, label: f.title }))} onChange={(v) => set('format', v as Format)} error={errors.format} />
        )}
        {about === 'box' && (
          <ChoiceField label="Box size" value={form.boxSize} options={BOX.sizes.map((s) => ({ id: s.id, label: `${s.pieces} pieces · AED ${s.price}` }))} onChange={(v) => set('boxSize', v)} error={errors.boxSize} />
        )}
        {about === 'box' && (
          <ChoiceField
            label="Your logo on the sleeve?"
            value={form.logo}
            options={[
              { id: 'yes', label: `Yes · ${BOX.minBranded}+ boxes` },
              { id: 'no', label: 'No' },
            ]}
            onChange={(v) => set('logo', v as QuoteForm['logo'])}
            error={errors.logo}
          />
        )}
        {about === 'workshop' && (
          <ChoiceField label="Where?" value={form.where} options={WORKSHOP.places.map((p) => ({ id: p.id, label: p.label }))} onChange={(v) => set('where', v as QuoteForm['where'])} error={errors.where} />
        )}
        <TextField label={about === 'box' ? 'How many boxes?' : 'How many people?'} inputMode="numeric" value={form.qty} onChange={(e) => set('qty', e.target.value)} error={errors.qty} autoComplete="off" />
        <TextField label={about === 'box' ? 'Deliver by' : 'Date'} type="date" min={earliestQuoteDate(about, form)} value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} />
        {about === 'event' && <TextField label="Office area" placeholder="For example: DIFC" value={form.area} onChange={(e) => set('area', e.target.value)} error={errors.area} autoComplete="off" />}
        <TextField label={about === 'workshop' ? 'Group name (optional)' : 'Company (optional)'} value={form.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" />
        <TextField label="Your name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoComplete="name" />
      </div>
      <div className="mt-xl flex flex-col gap-sm">
        <Button variant="claret" onClick={() => submit('whatsapp')}>
          Send on WhatsApp
        </Button>
        <Button variant="ghost" onClick={() => submit('email')}>
          Email instead
        </Button>
        {note && (
          <p className="t-caption text-cocoa-70" aria-live="polite">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

export function QuoteSheet() {
  const { overlay, close } = useUI();
  const q = overlay?.kind === 'quote' ? overlay : null;
  return (
    <Sheet open={q !== null} onClose={close} title={q ? `${QUOTE_INFO[q.about].name} · get a quote` : 'Get a quote'}>
      {q && <QuoteBody key={`${q.about}-${q.format ?? ''}`} about={q.about} format={q.format} />}
    </Sheet>
  );
}

/** `?about=box|workshop|event|table` opens the matching quote sheet — Instagram bio links use it. */
export function useQuoteFromUrl() {
  const { open } = useUI();
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('about');
    if (!v) return;
    const t = window.setTimeout(() => {
      if (v === 'table') open({ kind: 'quote', about: 'event', format: 'table' });
      else if (isQuoteAbout(v)) open({ kind: 'quote', about: v });
    }, 400);
    return () => window.clearTimeout(t);
  }, [open]);
}
