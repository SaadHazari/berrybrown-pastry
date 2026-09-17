import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, CreditCard, Home, Loader2, Lock, Truck } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { TIME_SLOTS, ZONES, PICKUP_ZONE_ID, getZone } from '../../data/zones';
import { createCheckoutSession, CheckoutError } from '../../lib/api';
import { EMPTY_FORM, loadForm, normalisePhone, saveForm, savePending, validateDetails, validateWhen, type CheckoutForm, type StepErrors } from '../../lib/checkoutState';
import { cn } from '../../lib/cn';
import { aed, prettyDate } from '../../lib/format';
import { spring } from '../../lib/motion';
import { orderRef, whatsappLink, whatsappOrderText } from '../../lib/order';
import { earliestDate, resolveLine, totals } from '../../lib/pricing';
import { useCart } from '../../store/cart';
import { useUI } from '../../store/ui';
import { AnimatedAED } from '../ui/AnimatedNumber';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Sheet } from '../ui/Sheet';
import { WhatsAppIcon } from '../layout/WhatsAppFab';

const STEPS = ['When & where', 'Your details', 'Review & pay'];

const localIso = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  return localIso(new Date(y, m - 1, d + n));
}

function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label} {hint && <span className="font-normal text-milk">{hint}</span>}
      </span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 block text-sm text-berry" role="alert">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

const inputCls = (err?: string) =>
  cn('h-12 w-full rounded-2xl bg-paper px-4 outline-none ring-1 transition placeholder:text-milk/50 focus:ring-2 focus:ring-berry', err ? 'ring-berry/70 animate-wiggle' : 'ring-cocoa/10');

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Checkout progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col gap-1.5" aria-current={i === step ? 'step' : undefined}>
          <div className="h-1.5 overflow-hidden rounded-full bg-oat">
            <motion.div className="h-full rounded-full bg-berry" initial={false} animate={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
          <span className={cn('flex items-center gap-1 text-xs', i <= step ? 'text-cocoa' : 'text-milk/70')}>
            {i < step && <Check className="size-3 text-berry" strokeWidth={3} />}
            {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Checkout() {
  const { overlay, close, open } = useUI();
  const { lines, clear } = useCart();
  const isOpen = overlay?.kind === 'checkout';
  const notice = overlay?.kind === 'checkout' ? overlay.notice : undefined;
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
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
  const zoneId = form.fulfilment === 'pickup' ? PICKUP_ZONE_ID : form.zoneId;
  const t = useMemo(() => (lines.length ? totals(lines, zoneId || PICKUP_ZONE_ID) : { subtotal: 0, delivery: 0, total: 0 }), [lines, zoneId]);
  const deliveryZones = ZONES.filter((z) => !z.pickup);

  const set = <K extends keyof CheckoutForm>(k: K, v: CheckoutForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const setCustomer = (k: keyof CheckoutForm['customer'], v: string) => {
    setForm((f) => ({ ...f, customer: { ...f.customer, [k]: v } }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    document.querySelector('[role="dialog"] [data-lenis-prevent]')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    const e = step === 0 ? validateWhen(form, earliest) : validateDetails(form);
    setErrors(e);
    if (Object.keys(e).length === 0) go(step + 1);
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
    const url = whatsappLink(whatsappOrderText(summary(ref, false)));
    window.open(url, '_blank', 'noopener');
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
      savePending({ ref, form, lines });
      window.location.assign(url);
    } catch (err) {
      const e = err instanceof CheckoutError ? err : new CheckoutError('Something went wrong starting payment.');
      setPayError({ msg: e.message, unavailable: e.unavailable });
      if (e.unavailable) set('payment', 'whatsapp');
      setBusy(false);
    }
  };

  const submit = () => (form.payment === 'online' ? payOnline() : sendWhatsApp());

  const footer = (
    <div className="flex items-center gap-3">
      {step > 0 && (
        <Button variant="soft" size="lg" onClick={() => go(step - 1)} aria-label="Back" className="px-4">
          <ArrowLeft className="size-5" />
        </Button>
      )}
      {step < 2 ? (
        <Button size="lg" className="flex-1" onClick={next}>
          Continue <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </Button>
      ) : (
        <Button size="lg" className="flex-1" onClick={submit} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Opening secure payment…
            </>
          ) : form.payment === 'online' ? (
            <>
              <Lock className="size-4" /> Pay <AnimatedAED value={t.total} />
            </>
          ) : (
            <>
              <WhatsAppIcon className="size-5" /> Send order on WhatsApp
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <Sheet open={isOpen} onClose={close} title="Checkout" footer={lines.length > 0 && footer} width="md:w-[540px]">
      <div className="px-5 pb-8 md:px-6">
        <Stepper step={step} />

        <div className="relative mt-6 overflow-x-clip">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: d * 40, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d * -40, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <div className="space-y-7">
                  <LayoutGroup id="fulfil">
                    <div role="radiogroup" aria-label="Delivery or pickup" className="grid grid-cols-2 gap-1 rounded-full bg-oat p-1">
                      {(
                        [
                          ['delivery', 'Delivery', Truck],
                          ['pickup', 'Pickup', Home],
                        ] as const
                      ).map(([id, label, Icon]) => (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={form.fulfilment === id}
                          onClick={() => set('fulfilment', id)}
                          className={cn('relative flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors', form.fulfilment === id ? 'text-cream' : 'text-cocoa/70')}
                        >
                          {form.fulfilment === id && <motion.span layoutId="fulfil-pill" className="absolute inset-0 rounded-full bg-cocoa" transition={spring.soft} />}
                          <Icon className="relative size-4" />
                          <span className="relative">{label}</span>
                        </button>
                      ))}
                    </div>
                  </LayoutGroup>

                  <AnimatePresence initial={false} mode="wait">
                    {form.fulfilment === 'delivery' ? (
                      <motion.div key="zones" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <Field label="Your area" error={errors.zoneId}>
                          <div role="radiogroup" className="grid gap-2">
                            {deliveryZones.map((z) => {
                              const active = form.zoneId === z.id;
                              const free = t.subtotal >= z.freeOver;
                              return (
                                <button
                                  key={z.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => set('zoneId', z.id)}
                                  className={cn('flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm ring-1 ring-inset transition', active ? 'bg-cocoa text-cream ring-cocoa' : 'bg-paper ring-cocoa/10 hover:ring-cocoa/30')}
                                >
                                  <span className="flex items-center gap-3">
                                    <span className={cn('grid size-5 place-items-center rounded-full ring-2', active ? 'ring-cream' : 'ring-cocoa/20')}>
                                      {active && <motion.span layoutId="zone-dot" className="size-2.5 rounded-full bg-cream" />}
                                    </span>
                                    {z.name}
                                  </span>
                                  <span className={cn('shrink-0 font-medium', free && (active ? 'text-blush' : 'text-sage'))}>{free ? 'Free' : aed(z.fee)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </Field>
                      </motion.div>
                    ) : (
                      <motion.div key="pickup" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className="rounded-2xl bg-sage-soft p-4 text-sm">
                          <p className="font-semibold">Pickup from our kitchen in Al Quoz</p>
                          <p className="mt-1 text-milk">We'll WhatsApp you the pin and have your cake chilled in a carry box.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Field label="Day" error={errors.date} hint={`· earliest ${prettyDate(earliest)}`}>
                    <div className="grid grid-cols-4 gap-2">
                      {quickDates.map((d) => {
                        const [wd, day, mon] = prettyDate(d).replace(',', '').split(' ');
                        const active = form.date === d;
                        return (
                          <motion.button
                            key={d}
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => {
                              set('date', d);
                              setShowOtherDate(false);
                            }}
                            aria-pressed={active}
                            className={cn('flex flex-col items-center rounded-2xl py-2.5 ring-1 ring-inset transition', active ? 'bg-cocoa text-cream ring-cocoa' : 'bg-paper ring-cocoa/10 hover:ring-cocoa/30')}
                          >
                            <span className={cn('text-[11px] uppercase tracking-wide', active ? 'text-cream/70' : 'text-milk')}>{d === addDays(localIso(new Date()), 1) ? 'Tmrw' : wd}</span>
                            <span className="font-display text-2xl leading-tight">{day}</span>
                            <span className={cn('text-[11px]', active ? 'text-cream/70' : 'text-milk')}>{mon}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    {showOtherDate || (form.date && !quickDates.includes(form.date)) ? (
                      <input type="date" min={earliest} value={form.date} onChange={(e) => set('date', e.target.value)} className={cn(inputCls(errors.date), 'mt-2')} aria-label="Pick another date" />
                    ) : (
                      <button type="button" onClick={() => setShowOtherDate(true)} className="mt-2 text-sm font-medium text-berry underline-offset-4 hover:underline">
                        Another day…
                      </button>
                    )}
                  </Field>

                  <Field label="Time" error={errors.slotId}>
                    <div role="radiogroup" className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((s) => (
                        <Chip key={s.id} selected={form.slotId === s.id} onSelect={() => set('slotId', s.id)} layoutGroup="slot">
                          {s.label}
                        </Chip>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <Field label="Name" error={errors.name}>
                    <input autoComplete="name" value={form.customer.name} onChange={(e) => setCustomer('name', e.target.value)} className={inputCls(errors.name)} placeholder="Layla Hassan" />
                  </Field>
                  <Field label="Mobile" error={errors.phone} hint="· for WhatsApp updates">
                    <input type="tel" inputMode="tel" autoComplete="tel" value={form.customer.phone} onChange={(e) => setCustomer('phone', e.target.value)} className={inputCls(errors.phone)} placeholder="050 123 4567" />
                  </Field>
                  <Field label="Email" error={errors.email} hint="· optional, for your receipt">
                    <input type="email" inputMode="email" autoComplete="email" value={form.customer.email} onChange={(e) => setCustomer('email', e.target.value)} className={inputCls(errors.email)} placeholder="layla@email.com" />
                  </Field>
                  {form.fulfilment === 'delivery' && (
                    <Field label="Address" error={errors.address}>
                      <textarea
                        rows={2}
                        autoComplete="street-address"
                        value={form.customer.address}
                        onChange={(e) => setCustomer('address', e.target.value)}
                        className={cn(inputCls(errors.address), 'h-auto py-3')}
                        placeholder="Villa / building, flat, street, area"
                      />
                    </Field>
                  )}
                  <Field label="Anything else?" hint="· optional">
                    <textarea rows={2} value={form.customer.notes} onChange={(e) => setCustomer('notes', e.target.value)} className={cn(inputCls(), 'h-auto py-3')} placeholder="Allergies, a surprise, gate code…" />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-paper p-5 ring-1 ring-cocoa/5">
                    <ul className="space-y-3">
                      {lines.map((l) => {
                        const { product, size, flavour } = resolveLine(l);
                        return (
                          <li key={l.key} className="flex items-center gap-3 text-sm">
                            <img src={product.image} alt="" className="size-12 rounded-xl object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium">
                                {l.qty} × {product.name}
                              </span>
                              <span className="block truncate text-xs text-milk">
                                {size.label} · {flavour.name}
                                {l.message && ` · “${l.message}”`}
                              </span>
                            </span>
                            <span className="font-medium">{aed(size.price * l.qty)}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <dl className="mt-4 space-y-1.5 border-t border-dashed border-cocoa/15 pt-4 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-milk">Subtotal</dt>
                        <dd>{aed(t.subtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-milk">{form.fulfilment === 'pickup' ? 'Pickup' : `Delivery · ${getZone(zoneId)?.name ?? ''}`}</dt>
                        <dd>{t.delivery ? aed(t.delivery) : <span className="font-medium text-sage">Free</span>}</dd>
                      </div>
                      <div className="flex justify-between pt-2 font-display text-2xl">
                        <dt>Total</dt>
                        <dd>
                          <AnimatedAED value={t.total} />
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-xs text-milk">
                      {form.fulfilment === 'pickup' ? 'Pickup' : 'Delivery'} on <strong className="text-cocoa">{form.date && prettyDate(form.date)}</strong>, {TIME_SLOTS.find((s) => s.id === form.slotId)?.label} · {form.customer.name}
                      <button type="button" onClick={() => go(0)} className="ml-2 font-medium text-berry hover:underline">
                        Edit
                      </button>
                    </p>
                  </div>

                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold">How would you like to pay?</legend>
                    <div role="radiogroup" className="grid gap-2">
                      {(
                        [
                          { id: 'online', title: 'Pay online now', text: 'Card or Apple Pay · secure Stripe checkout', icon: <CreditCard className="size-5" />, tag: 'Fastest' },
                          { id: 'whatsapp', title: 'Order on WhatsApp', text: 'Safa confirms, then pay by transfer or cash', icon: <WhatsAppIcon className="size-5" /> },
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
                            className={cn('relative flex items-center gap-4 rounded-2xl p-4 text-left ring-1 ring-inset transition', active ? 'bg-cocoa text-cream ring-cocoa' : 'bg-paper ring-cocoa/10 hover:ring-cocoa/30')}
                          >
                            <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', active ? 'bg-cream/15' : 'bg-oat')}>{o.icon}</span>
                            <span className="flex-1">
                              <span className="block font-semibold">{o.title}</span>
                              <span className={cn('block text-xs', active ? 'text-cream/70' : 'text-milk')}>{o.text}</span>
                            </span>
                            {'tag' in o && <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', active ? 'bg-berry' : 'bg-blush text-berry-deep')}>{o.tag}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <AnimatePresence>
                    {payError && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-blush px-4 py-3 text-sm text-berry-deep" role="alert">
                        {payError.msg}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <p className="flex items-center gap-2 text-xs text-milk">
                    <Lock className="size-3.5" /> We only use your details for this order.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Sheet>
  );
}
