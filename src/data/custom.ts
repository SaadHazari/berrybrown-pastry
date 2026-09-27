import { PRODUCTS } from './products';

export type Pick = { id: string; label: string };
export type ServeOption = Pick & { size: string; from: number; note?: string };

export const OTHER = 'other';

export const OCCASIONS: Pick[] = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'baby', label: 'Baby shower' },
  { id: OTHER, label: 'Something else' },
];

export const SERVES: ServeOption[] = [
  { id: 'up-to-6', label: 'Up to 6', size: '5"', from: 300 },
  { id: '6-8', label: '6–8', size: '6"', from: 300 },
  { id: '10-14', label: '10–14', size: '8"', from: 420 },
  { id: 'more', label: 'More', size: 'Two tiers', from: 850, note: 'Two tiers are quoted separately.' },
];

export const LOOKS: Pick[] = [
  { id: 'buttercream', label: 'Soft buttercream' },
  { id: 'flowers', label: 'Fresh flowers' },
  { id: 'drip', label: 'Drip & berries' },
  { id: OTHER, label: 'Something else' },
];

export const FLAVOURS: Pick[] = [...PRODUCTS.map((p) => ({ id: p.id, label: p.name })), { id: OTHER, label: 'Something else' }];

export const CUSTOM_FLAVOUR_ADD = 60;
export const WORDS_MAX = 35;
export const OTHER_MAX = 60;
export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const CUSTOM_LEAD_HOURS = 48;

export type CustomForm = {
  occasion: string;
  occasionOther: string;
  serves: string;
  look: string;
  flavour: string;
  flavourOther: string;
  words: string;
  date: string;
};

export const EMPTY_CUSTOM: CustomForm = {
  occasion: '',
  occasionOther: '',
  serves: '',
  look: '',
  flavour: '',
  flavourOther: '',
  words: '',
  date: '',
};

export type CustomErrors = Partial<Record<keyof CustomForm, string>>;

const localIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Earliest date for a custom cake: today + 48 hours. */
export function earliestCustomDate(now: Date = new Date()): string {
  return localIso(new Date(now.getTime() + CUSTOM_LEAD_HOURS * 3_600_000));
}

export function serveOption(id: string): ServeOption | undefined {
  return SERVES.find((s) => s.id === id);
}

/** The from-price shown in the summary. Lowest tier until a size is picked. */
export function customFromPrice(f: CustomForm): number {
  return serveOption(f.serves)?.from ?? SERVES[0].from;
}

const pickLabel = (list: Pick[], id: string, other: string) => {
  if (!id) return '';
  if (id === OTHER) return other.trim() || 'Something else';
  return list.find((p) => p.id === id)?.label ?? '';
};

export type SummaryRow = { label: string; value: string };

/** The six answers, in order, as label/value rows. Empty values mean "not picked yet". */
export function customSummary(f: CustomForm): SummaryRow[] {
  const serve = serveOption(f.serves);
  return [
    { label: 'Occasion', value: pickLabel(OCCASIONS, f.occasion, f.occasionOther) },
    { label: 'People', value: serve ? `${serve.label} · ${serve.size}` : '' },
    { label: 'Look', value: pickLabel(LOOKS, f.look, '') || (f.look === OTHER ? 'Something else' : '') },
    { label: 'Flavour', value: pickLabel(FLAVOURS, f.flavour, f.flavourOther) },
    { label: 'Words', value: f.words.trim() },
    { label: 'Date', value: f.date },
  ];
}

export function validateCustom(f: CustomForm, earliest: string = earliestCustomDate()): CustomErrors {
  const e: CustomErrors = {};
  if (!f.occasion) e.occasion = 'Pick an occasion';
  else if (f.occasion === OTHER && !f.occasionOther.trim()) e.occasionOther = 'Tell us the occasion';
  if (!f.serves) e.serves = 'Pick how many people';
  if (!f.look) e.look = 'Pick a look';
  if (!f.flavour) e.flavour = 'Pick a flavour';
  else if (f.flavour === OTHER && !f.flavourOther.trim()) e.flavourOther = 'Tell us the flavour';
  if (f.words.length > WORDS_MAX) e.words = `Keep it under ${WORDS_MAX} characters`;
  if (!f.date) e.date = 'Pick a date';
  else if (f.date < earliest) e.date = 'Custom cakes need 48 hours';
  return e;
}
