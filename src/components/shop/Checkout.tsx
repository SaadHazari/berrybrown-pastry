import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { DELIVERY_ZONE, DUBAI_ZONE_ID, PICKUP_ZONE_ID, TIME_SLOTS } from '../../data/zones';
import { createCheckoutSession, CheckoutError, recordOrder } from '../../lib/api';
import { EMPTY_FORM, loadForm, normalisePhone, saveForm, savePending, validateDetails, validateWhen, type CheckoutForm, type StepErrors } from '../../lib/checkoutState';
import { cn } from '../../lib/cn';
import { aed, prettyDate } from '../../lib/format';
import { orderRef, whatsappLink, whatsappOrderText } from '../../lib/order';
import { earliestDate, resolveLine, totals } from '../../lib/pricing';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { WhatsAppIcon } from '../ui/Icons';
import { Sheet } from '../ui/Sheet';

const STEPS = ['When and where', 'Your details', 'Review and pay'];

const localIso = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  return localIso(new Date(y, m - 1, d + n));
}

function Field({ label, error, children, hint, group }: { label: string; error?: string; hint?: string; children: ReactNode; group?: boolean }) {
  const id = useId();
  const Wrapper = group ? 'div' : 'label';
  return (
    <Wrapper className="block" {...(group ? { role: 'group', 'aria-labelledby': id } : {})}>
      <span id={id} className="flex items-baseline justify-between gap-md">
        <span className="t-label text-cocoa-70">{label}</span>
        {hint && <span className="t-caption text-cocoa-70">{hint}</span>}
      </span>
      <div className="mt-sm">{children}</div>
      {error && (
        <span className="t-caption mt-xs block text-cocoa" role="alert">
          {error}
        </span>
      )}
    </Wrapper>
  );
}

const inputCls = (err?: string) => cn('field', err && 'border-cocoa');

function Progress({ step }: { step: number }) {
  return (
    <div aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
      <p className="t-label text-cocoa-70">
        Step {step + 1} of {STEPS.length} · <span className="text-cocoa">{STEPS[step]}</span>
      </p>
      <ol className="mt-sm flex gap-xs" aria-hidden>
        {STEPS.map((s, i) => (
          <li key={s} className={cn('h-px flex-1', i <= step ? 'bg-cocoa' : 'bg-cocoa-15')} />
        ))}
      </ol>
    </div>
  );
}

export function Checkout() {
  const { overlay, close, open } = useUI();
  const { lines, clear } = useCart();
  const isOpen = overlay?.kind === 'checkout';
  const notice = overlay?.kind === 'checkout' ? overlay.notice : undefined;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<StepErrors>({});
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<{ msg: string; unavailable: boolean } | null>(null);
  const [showOtherDate, setShowOtherDate] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(loadForm());
    setStep(0);
    setErrors({});
    setPayError(notice ? { msg: notice, unavailable: false } : null);
  }, [isOpen, notice]);

  useEffect(() => {
    if (isOpen) saveForm(form);
  }, [form, isOpen]);

  // Bag emptied while open (e.g. in another tab)
  useEffect(() => {
    if (isOpen && lines.length === 0) open({ kind: 'cart' });
  }, [isOpen, lines.length, open]);

  const earliest = useMemo(() => earliestDate(lines), [lines]);
  const quickDates = useMemo(() => [0, 1, 2, 3].map((n) => addDays(earliest, n)), [earliest]);
  const zoneId = form.fulfilment === 'pickup' ? PICKUP_ZONE_ID : DUBAI_ZONE_ID;
  const t = useMemo(() => (lines.length ? totals(lines, zoneId) : { subtotal: 0, delivery: 0, total: 0 }), [lines, zoneId]);

  const set = <K extends keyof CheckoutForm>(k: K, v: CheckoutForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const setCustomer = (k: keyof CheckoutForm['customer'], v: string) => {
    setForm((f) => ({ ...f, customer: { ...f.customer, [k]: v } }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const go = (to: number) => {
    setStep(to);
    document.querySelector('[role="dialog"] [data-sheet-scroll]')?.scrollTo({ top: 0 });
  };

  const next = () => {
    const e = step === 0 ? validateWhen({ ...form, zoneId }, earliest) : validateDetails(form);
    setErrors(e);
    if (Object.keys(e).length === 0) go(step + 1);
    else window.setTimeout(() => document.querySelector('[role="dialog"] [role="alert"]')?.scrollIntoView({ block: 'center' }), 60);
  };

  const summary = (ref: string, paid: boolean) => ({
    ref,
    lines,
    zoneId,
    date: form.date,
    slotId: form.slotId,
    customer: { ...form.customer, phone: normalisePhone(form.customer.phone) },
    paid,
  });

  const sendWhatsApp = () => {
    const ref = orderRef();
    const s = summary(ref, false);
    const url = whatsappLink(whatsappOrderText(s));
    window.open(url, '_blank', 'noopener');
    recordOrder({ ref, lines: s.lines, zoneId, date: s.date, slotId: s.slotId, customer: s.customer });
    clear();
    saveForm(EMPTY_FORM);
    open({ kind: 'success', ref, paid: false, whatsappUrl: url });
  };

  const payOnline = async () => {
    setBusy(true);
    setPayError(null);
    const ref = orderRef();
    try {
      const s = summary(ref, true);
      const url = await createCheckoutSession({ ref, lines: s.lines, zoneId, date: s.date, slotId: s.slotId, customer: s.customer });
      savePending({ ref, form: { ...form, zoneId }, lines });
      window.location.assign(url);
    } catch (err) {
      const e = err instanceof CheckoutError ? err : new CheckoutError('Something went wrong starting payment.');
      setPayError({ msg: e.message, unavailable: e.unavailable });
      if (e.unavailable) set('payment', 'whatsapp');
      setBusy(false);
      window.setTimeout(() => document.querySelector('[role="dialog"] [role="alert"]')?.scrollIntoView({ block: 'center' }), 80);
    }
  };

  const submit = () => (form.payment === 'online' ? payOnline() : sendWhatsApp());

  const footer = (
    <div className="flex items-center gap-sm">
      {step > 0 && (
        <Button variant="ghost" onClick={() => go(step - 1)}>
          Back
        </Button>
      )}
      {step < 2 ? (
        <Button variant="cocoa" className="flex-1" onClick={next}>
          Continue
        </Button>
      ) : (
        <Button variant="claret" className="flex-1" onClick={submit} disabled={busy}>
          {busy ? 'Opening secure payment…' : form.payment === 'online' ? `Pay ${aed(t.total)}` : 'Order on WhatsApp'}
        </Button>
      )}
    </div>
  );

  return (
    <Sheet open={isOpen} onClose={close} title="Checkout" footer={lines.length > 0 && footer} width="md:w-[540px]">
      <div className="px-md py-md md:px-lg">
        <Progress step={step} />

        {payError && (
          <p className="t-callout mt-md rounded border border-cocoa-15 bg-rose px-md py-sm" role="alert">
            {payError.msg}
          </p>
        )}

        <div className="mt-lg">
          {step === 0 && (
            <div className="space-y-lg">
              <Field group label="Delivery or pickup">
                <div role="radiogroup" className="grid grid-cols-2 gap-xs">
                  <Chip selected={form.fulfilment === 'delivery'} onSelect={() => set('fulfilment', 'delivery')}>
                    Delivery
                  </Chip>
                  <Chip selected={form.fulfilment === 'pickup'} onSelect={() => set('fulfilment', 'pickup')}>
                    Pickup
                  </Chip>
                </div>
                <p className="t-caption mt-xs text-cocoa-70">
                  {form.fulfilment === 'delivery'
                    ? `Across Dubai, ${aed(DELIVERY_ZONE.fee)}. Free over ${aed(DELIVERY_ZONE.freeOver)}. Chilled, with ice packs.`
                    : 'Pickup from the studio. We send the pin on WhatsApp.'}
                </p>
              </Field>

              <Field group label="Day" error={errors.date} hint={`Earliest ${prettyDate(earliest)}`}>
                <div className="grid grid-cols-4 gap-xs">
                  {quickDates.map((d) => {
                    const [wd, day, mon] = prettyDate(d).replace(',', '').split(' ');
                    const active = form.date === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          set('date', d);
                          setShowOtherDate(false);
                        }}
                        aria-pressed={active}
                        className={cn('chip flex-col gap-2xs py-xs normal-case tracking-normal', active && 'chip-on')}
                      >
                        <span className="t-label">{d === addDays(localIso(new Date()), 1) ? 'Tmrw' : wd}</span>
                        <span className="t-price text-[1.1rem]">{day}</span>
                        <span className="t-label">{mon}</span>
                      </button>
                    );
                  })}
                </div>
                {showOtherDate || (form.date && !quickDates.includes(form.date)) ? (
                  <input name="date" type="date" min={earliest} value={form.date} onChange={(e) => set('date', e.target.value)} className={cn(inputCls(errors.date), 'mt-sm')} aria-label="Pick another date" />
                ) : (
                  <button type="button" onClick={() => setShowOtherDate(true)} className="t-label link mt-sm">
                    Another day
                  </button>
                )}
              </Field>

              <Field group label="Time" error={errors.slotId}>
                <div role="radiogroup" className="grid grid-cols-3 gap-xs">
                  {TIME_SLOTS.map((s) => (
                    <Chip key={s.id} selected={form.slotId === s.id} onSelect={() => set('slotId', s.id)}>
                      {s.label}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-lg">
              <Field label="Name" error={errors.name}>
                <input name="name" autoComplete="name" value={form.customer.name} onChange={(e) => setCustomer('name', e.target.value)} className={inputCls(errors.name)} />
              </Field>
              <Field label="Mobile" error={errors.phone} hint="For WhatsApp updates">
                <input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.customer.phone} onChange={(e) => setCustomer('phone', e.target.value)} className={inputCls(errors.phone)} placeholder="050 123 4567" />
              </Field>
              <Field label="Email" error={errors.email} hint="Optional, for your receipt">
                <input name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} value={form.customer.email} onChange={(e) => setCustomer('email', e.target.value)} className={inputCls(errors.email)} />
              </Field>
              {form.fulfilment === 'delivery' && (
                <Field label="Address" error={errors.address}>
                  <textarea rows={2} name="address" autoComplete="street-address" value={form.customer.address} onChange={(e) => setCustomer('address', e.target.value)} className={cn(inputCls(errors.address), 'h-auto')} placeholder="Villa or building, flat, street, area" />
                </Field>
              )}
              <Field label="Anything else" hint="Optional">
                <textarea name="notes" rows={2} value={form.customer.notes} onChange={(e) => setCustomer('notes', e.target.value)} className={cn(inputCls(), 'h-auto')} placeholder="Allergies, a surprise, gate code" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-lg">
              <div>
                <ul className="border-t border-cocoa-15" role="list">
                  {lines.map((l) => {
                    const { product, size, flavour } = resolveLine(l);
                    return (
                      <li key={l.key} className="flex items-start justify-between gap-md border-b border-cocoa-15 py-sm">
                        <span className="min-w-0">
                          <span className="t-callout block">
                            {l.qty} × {product.name}
                          </span>
                          <span className="t-caption block text-cocoa-70">
                            {size.label} · {flavour.name}
                            {l.message && ` · “${l.message}”`}
                          </span>
                        </span>
                        <span className="t-price shrink-0">{aed(size.price * l.qty)}</span>
                      </li>
                    );
                  })}
                </ul>
                <dl className="mt-sm space-y-2xs">
                  <div className="flex justify-between">
                    <dt className="t-caption text-cocoa-70">Subtotal</dt>
                    <dd className="t-price">{aed(t.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="t-caption text-cocoa-70">{form.fulfilment === 'pickup' ? 'Pickup' : `Delivery · Dubai`}</dt>
                    <dd className="t-price">{t.delivery ? aed(t.delivery) : form.fulfilment === 'pickup' ? '—' : `Free over ${aed(DELIVERY_ZONE.freeOver)}`}</dd>
                  </div>
                  <div className="flex justify-between border-t border-cocoa-15 pt-xs">
                    <dt className="t-heading">Total</dt>
                    <dd className="t-price text-[1.1rem]">{aed(t.total)}</dd>
                  </div>
                </dl>
                <p className="t-caption mt-sm text-cocoa-70">
                  {form.fulfilment === 'pickup' ? 'Pickup' : 'Delivery'} on {form.date && prettyDate(form.date)}, {TIME_SLOTS.find((s) => s.id === form.slotId)?.label} · {form.customer.name}.{' '}
                  <button type="button" onClick={() => go(0)} className="link">
                    Edit
                  </button>
                </p>
              </div>

              <Field group label="How would you like to pay?">
                <div role="radiogroup" className="grid gap-xs">
                  {(
                    [
                      { id: 'online', title: 'Pay online now', text: 'Card or Apple Pay. Secure Stripe checkout.' },
                      { id: 'whatsapp', title: 'Order on WhatsApp', text: 'Safa confirms, then pay by transfer or cash.' },
                    ] as const
                  ).map((o) => {
                    const active = form.payment === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => set('payment', o.id)}
                        className={cn('flex items-center gap-md rounded border p-md text-left transition-colors', active ? 'border-cocoa bg-cocoa text-butter' : 'border-cocoa-15 hover:bg-cocoa/6')}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="t-heading block">{o.title}</span>
                          <span className={cn('t-caption block', active ? 'text-butter-60' : 'text-cocoa-70')}>{o.text}</span>
                        </span>
                        {o.id === 'whatsapp' && <WhatsAppIcon className="size-[18px] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <p className="t-caption text-cocoa-70">We only use your details for this order.</p>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
