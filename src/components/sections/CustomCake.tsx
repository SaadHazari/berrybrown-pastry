import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CUSTOM_FLAVOUR_ADD,
  EMPTY_CUSTOM,
  FLAVOURS,
  LOOKS,
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  OCCASIONS,
  OTHER,
  OTHER_MAX,
  SERVES,
  WORDS_MAX,
  customFromPrice,
  customSummary,
  earliestCustomDate,
  serveOption,
  validateCustom,
  type CustomErrors,
  type CustomForm,
} from '../../data/custom';
import { media } from '../../data/media';
import { recordEnquiry, uploadInspiration } from '../../lib/api';
import { cn } from '../../lib/cn';
import { aed, prettyDate } from '../../lib/format';
import { ACCEPTED_INPUT } from '../../lib/image';
import { customCakeMessage, whatsappLink } from '../../lib/order';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Photo } from '../ui/Photo';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

type Shot = { id: string; file: File; preview: string | null };

const PREVIEWABLE = ['image/jpeg', 'image/png', 'image/webp'];

function Group({ n, label, error, hint, children }: { n: number; label: string; error?: string; hint?: string; children: (labelId: string) => ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={`${id}-l`} aria-describedby={error ? `${id}-e` : undefined}>
      <p id={`${id}-l`} className="flex items-baseline gap-sm">
        <span className="t-label text-cocoa-70">{String(n).padStart(2, '0')}</span>
        <span className="t-heading">{label}</span>
      </p>
      <div className="mt-sm">{children(`${id}-l`)}</div>
      {hint && !error && <p className="t-caption mt-xs text-cocoa-70">{hint}</p>}
      {error && (
        <p id={`${id}-e`} role="alert" className="t-caption mt-xs text-cocoa">
          {error}
        </p>
      )}
    </div>
  );
}

function Chips({ options, value, onChange, labelId }: { options: { id: string; label: string }[]; value: string; onChange(id: string): void; labelId: string }) {
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-2 gap-xs lg:flex lg:flex-wrap">
      {options.map((o) => (
        <Chip key={o.id} selected={value === o.id} onSelect={() => onChange(o.id)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

export function CustomCake() {
  const [form, setForm] = useState<CustomForm>(EMPTY_CUSTOM);
  const [errors, setErrors] = useState<CustomErrors>({});
  const [shots, setShots] = useState<Shot[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const earliest = useMemo(() => earliestCustomDate(), []);
  const price = customFromPrice(form);
  const serve = serveOption(form.serves);
  const rows = customSummary(form);

  const set = <K extends keyof CustomForm>(k: K, v: CustomForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setNote('');
  };

  useEffect(() => () => shots.forEach((s) => s.preview && URL.revokeObjectURL(s.preview)), [shots]);

  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list);
    const next: Shot[] = [];
    let err = '';
    for (const file of files) {
      if (shots.length + next.length >= MAX_PHOTOS) {
        err = `Up to ${MAX_PHOTOS} photos.`;
        break;
      }
      const name = file.name.toLowerCase();
      const looksLikeImage = file.type.startsWith('image/') || name.endsWith('.heic') || name.endsWith('.heif');
      if (!looksLikeImage) {
        err = 'JPG, PNG or HEIC photos only.';
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        err = 'Each photo must be under 10 MB.';
        continue;
      }
      next.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file, preview: PREVIEWABLE.includes(file.type) ? URL.createObjectURL(file) : null });
    }
    setPhotoError(err);
    if (next.length) setShots((s) => [...s, ...next].slice(0, MAX_PHOTOS));
  };

  const removeShot = (id: string) => {
    setShots((s) => {
      const gone = s.find((x) => x.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return s.filter((x) => x.id !== id);
    });
    setPhotoError('');
  };

  const send = async () => {
    const e = validateCustom(form, earliest);
    setErrors(e);
    if (Object.keys(e).length) {
      setNote('Please answer the marked questions.');
      window.setTimeout(() => document.querySelector('#custom [role="alert"]')?.scrollIntoView({ block: 'center' }), 40);
      return;
    }
    // Open the tab now (inside the click), fill it after the upload — Safari blocks async window.open.
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
    recordEnquiry({ kind: 'custom', answers: { ...form }, fromPrice: price, photos: urls, message });
    if (popup) popup.location.href = link;
    else if (shots.length) window.location.assign(link);
    else window.open(link, '_blank', 'noopener,noreferrer');
    setBusy(false);
    setNote(unsent ? 'The photos did not upload. Attach them in WhatsApp.' : 'Your message is ready in WhatsApp.');
  };

  const stripSummary = [`From ${aed(price)}`, rows[0].value, rows[1].value.split(' · ')[0]].filter(Boolean).join(' · ');

  return (
    <section id="custom" className="section-more" aria-labelledby="custom-title">
      <Reveal className="container-x">
        <SectionHeading id="custom-title" title="Design your cake" oneliner="Six questions. We reply on WhatsApp with the price." />

        <div className="mt-xl grid gap-xl lg:grid-cols-12 lg:gap-2xl">
          <form
            className="space-y-xl lg:col-span-7"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Group n={1} label="What's the occasion?" error={errors.occasion ?? errors.occasionOther}>
              {(labelId) => (
                <>
                  <Chips options={OCCASIONS} value={form.occasion} onChange={(v) => set('occasion', v)} labelId={labelId} />
                  {form.occasion === OTHER && (
                    <input
                      className="field mt-sm max-w-[26rem]"
                      maxLength={OTHER_MAX}
                      value={form.occasionOther}
                      onChange={(e) => set('occasionOther', e.target.value)}
                      placeholder="Which occasion?"
                      aria-label="Which occasion?"
                      autoComplete="off"
                    />
                  )}
                </>
              )}
            </Group>

            <Group n={2} label="How many people?" error={errors.serves} hint={serve?.note}>
              {(labelId) => <Chips options={SERVES.map((s) => ({ id: s.id, label: `${s.label} · ${s.size}` }))} value={form.serves} onChange={(v) => set('serves', v)} labelId={labelId} />}
            </Group>

            <Group n={3} label="Pick a look" error={errors.look ?? photoError}>
              {(labelId) => (
                <>
                  <Chips options={LOOKS} value={form.look} onChange={(v) => set('look', v)} labelId={labelId} />
                  <div
                    className="mt-md rounded lg:border lg:border-dashed lg:border-cocoa-15 lg:p-md"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addFiles(e.dataTransfer.files);
                    }}
                  >
                    <p className="t-label text-cocoa-70">Add up to {MAX_PHOTOS} inspiration photos</p>
                    <div className="mt-sm flex flex-wrap items-center gap-sm">
                      {shots.map((s) => (
                        <div key={s.id} className="relative size-[88px] overflow-hidden rounded bg-rose">
                          {s.preview ? (
                            <img src={s.preview} alt="" className="size-full object-cover" />
                          ) : (
                            <span className="t-label absolute inset-0 grid place-items-center text-cocoa-70">HEIC</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeShot(s.id)}
                            className="t-price absolute right-2xs top-2xs grid size-[28px] place-items-center rounded bg-butter text-cocoa"
                            aria-label="Remove photo"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {shots.length < MAX_PHOTOS && (
                        <button type="button" onClick={() => fileRef.current?.click()} className="chip">
                          Add photos
                        </button>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept={ACCEPTED_INPUT}
                        multiple
                        className="sr-only"
                        tabIndex={-1}
                        aria-label="Add photos"
                        onChange={(e) => {
                          if (e.target.files) addFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </div>
                    <p className="t-caption mt-xs hidden text-cocoa-70 lg:block">Or drop them here. JPG, PNG or HEIC, up to 10 MB each.</p>
                  </div>
                </>
              )}
            </Group>

            <Group n={4} label="Flavour" error={errors.flavour ?? errors.flavourOther} hint={form.flavour === OTHER ? `Custom flavours are +${CUSTOM_FLAVOUR_ADD}` : undefined}>
              {(labelId) => (
                <>
                  <Chips options={FLAVOURS} value={form.flavour} onChange={(v) => set('flavour', v)} labelId={labelId} />
                  {form.flavour === OTHER && (
                    <input
                      className="field mt-sm max-w-[26rem]"
                      maxLength={OTHER_MAX}
                      value={form.flavourOther}
                      onChange={(e) => set('flavourOther', e.target.value)}
                      placeholder="Which flavour?"
                      aria-label="Which flavour?"
                      autoComplete="off"
                    />
                  )}
                </>
              )}
            </Group>

            <Group n={5} label="Words on the cake" error={errors.words}>
              {(labelId) => (
                <div className="max-w-[26rem]">
                  <input
                    className="field"
                    maxLength={WORDS_MAX}
                    value={form.words}
                    onChange={(e) => set('words', e.target.value)}
                    placeholder="Optional"
                    aria-labelledby={labelId}
                    autoComplete="off"
                  />
                  <p className="t-price mt-xs text-right text-cocoa-70" aria-live="polite">
                    {form.words.length}/{WORDS_MAX}
                  </p>
                </div>
              )}
            </Group>

            <Group n={6} label="When is it?" error={errors.date} hint="48 hours for custom. A week for two tiers.">
              {(labelId) => <input type="date" className="field max-w-[16rem]" min={earliest} value={form.date} onChange={(e) => set('date', e.target.value)} aria-labelledby={labelId} />}
            </Group>
          </form>

          <aside className="hidden lg:col-span-5 lg:block" aria-label="Your cake">
            <div className="rounded border border-cocoa-15 p-md lg:sticky lg:top-[calc(64px+var(--spacing-lg))]">
              <Photo media={media.looks.custom} />
              <h3 className="t-heading mt-md">Your cake</h3>
              <dl className="mt-sm border-t border-cocoa-15">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-md border-b border-cocoa-15 py-xs">
                    <dt className="t-label text-cocoa-70">{r.label}</dt>
                    <dd className="t-callout text-right">{r.label === 'Date' && r.value ? prettyDate(r.value) : r.value || '—'}</dd>
                  </div>
                ))}
              </dl>
              <p className="t-price mt-md">From {aed(price)}</p>
              <p className="t-caption mt-2xs text-cocoa-70">Final price on WhatsApp. 50% deposit confirms the slot.</p>
              <Button variant="claret" className="mt-md w-full" onClick={send} disabled={busy}>
                {busy ? 'Uploading photos…' : 'Send on WhatsApp'}
              </Button>
              {note && (
                <p className="t-caption mt-sm text-cocoa-70" aria-live="polite">
                  {note}
                </p>
              )}
            </div>
          </aside>
        </div>

        {/* Mobile: the summary card collapses to a one-line strip pinned at the bottom. */}
        <div className="sticky bottom-0 z-30 -mx-md mt-xl border-t border-cocoa-15 bg-butter/92 px-md pt-sm pb-safe backdrop-blur-[8px] lg:hidden">
          <div className="flex items-center gap-md">
            <p className={cn('t-price min-w-0 truncate', !form.serves && 'text-cocoa-70')}>{stripSummary}</p>
            <Button variant="claret" className="ml-auto shrink-0" onClick={send} disabled={busy}>
              {busy ? 'Uploading…' : 'Send on WhatsApp'}
            </Button>
          </div>
          {note && (
            <p className="t-caption mt-xs text-cocoa-70" aria-live="polite">
              {note}
            </p>
          )}
        </div>
      </Reveal>
    </section>
  );
}
