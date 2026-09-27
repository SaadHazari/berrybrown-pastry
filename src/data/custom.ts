import { addDays, localIso } from '../lib/dates';
import { media, type Media } from './media';

export const CUSTOMISED = 'customised';

export type Option = { id: string; label: string; sub?: string; image?: Media };
export type SizeOption = Option & { size: string; from: number };

export const OCCASIONS: Option[] = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'baby', label: 'Baby shower' },
  { id: CUSTOMISED, label: 'Customised' },
];

export const SIZES: SizeOption[] = [
  { id: '6in', label: '6–8 people', size: '6 inch', from: 300, sub: '6 inch · from AED 300' },
  { id: '8in', label: '10–14 people', size: '8 inch', from: 420, sub: '8 inch · from AED 420' },
  { id: 'tiers', label: '20–30 people', size: 'Two tiers', from: 850, sub: 'Two tiers · from AED 850' },
  { id: CUSTOMISED, label: 'Customised', size: 'Quoted by our team', from: 300, sub: 'Quoted by our team' },
];

export const LOOKS: Option[] = [
  { id: 'buttercream', label: 'Soft buttercream', image: media.looks.buttercream },
  { id: 'flowers', label: 'Fresh flowers', image: media.looks.flowers },
  { id: 'drip', label: 'Drip & berries', image: media.looks.drip },
  { id: CUSTOMISED, label: 'Customised', image: media.looks.custom },
];

export const FLAVOURS: Option[] = [
  { id: 'chocolate-berry', label: 'Chocolate & berry' },
  { id: 'pistachio', label: 'Pistachio & kunafa' },
  { id: 'vanilla-berry', label: 'Vanilla & berries' },
  { id: CUSTOMISED, label: 'Customised', sub: '+ AED 60' },
];

export type StepId = 'occasion' | 'serves' | 'look' | 'flavour' | 'words' | 'date';

export const CUSTOM_STEPS: { id: StepId; question: string }[] = [
  { id: 'occasion', question: 'What are we celebrating?' },
  { id: 'serves', question: 'How many people?' },
  { id: 'look', question: 'Pick a look.' },
  { id: 'flavour', question: 'Pick a flavour.' },
  { id: 'words', question: 'Any words on the cake?' },
  { id: 'date', question: 'When is it?' },
];

export const CUSTOM_FLAVOUR_ADD = 60;
export const WORDS_MAX = 35;
export const OTHER_MAX = 60;
export const IDEA_MAX = 120;
export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const CUSTOM_LEAD_DAYS = 7;

export type CustomForm = {
  occasion: string;
  occasionOther: string;
  serves: string;
  servesOther: string;
  look: string;
  lookOther: string;
  flavour: string;
  flavourOther: string;
  words: string;
  noWords: boolean;
  date: string;
};

export const EMPTY_CUSTOM: CustomForm = {
  occasion: '',
  occasionOther: '',
  serves: '',
  servesOther: '',
  look: '',
  lookOther: '',
  flavour: '',
  flavourOther: '',
  words: '',
  noWords: false,
  date: '',
};

const OTHER_KEY = { occasion: 'occasionOther', serves: 'servesOther', look: 'lookOther', flavour: 'flavourOther' } as const;

/** Earliest date for a custom cake: a week from today. */
export function earliestCustomDate(now: Date = new Date()): string {
  return localIso(addDays(now, CUSTOM_LEAD_DAYS));
}

/** Answered, and Customised only with its text. Words are optional, so that step is always done. */
export function isStepDone(step: StepId, f: CustomForm, earliest: string = earliestCustomDate()): boolean {
  if (step === 'words') return true;
  if (step === 'date') return f.date !== '' && f.date >= earliest;
  const v = f[step];
  if (!v) return false;
  return v !== CUSTOMISED || f[OTHER_KEY[step]].trim().length > 0;
}

export function remaining(f: CustomForm, earliest?: string): number {
  return CUSTOM_STEPS.filter((s) => !isStepDone(s.id, f, earliest)).length;
}

export function customFromPrice(f: CustomForm): number {
  const base = SIZES.find((s) => s.id === f.serves)?.from ?? SIZES[0].from;
  return base + (f.flavour === CUSTOMISED ? CUSTOM_FLAVOUR_ADD : 0);
}

export type CustomErrors = Partial<Record<keyof CustomForm, string>>;

export function validateCustom(f: CustomForm, earliest: string = earliestCustomDate()): CustomErrors {
  const e: CustomErrors = {};
  if (!f.occasion) e.occasion = 'Pick an occasion';
  else if (f.occasion === CUSTOMISED && !f.occasionOther.trim()) e.occasionOther = 'Tell us the occasion';
  if (!f.serves) e.serves = 'Pick how many people';
  else if (f.serves === CUSTOMISED && !f.servesOther.trim()) e.servesOther = 'Tell us how many people';
  if (!f.look) e.look = 'Pick a look';
  else if (f.look === CUSTOMISED && !f.lookOther.trim()) e.lookOther = 'Describe your idea';
  if (!f.flavour) e.flavour = 'Pick a flavour';
  else if (f.flavour === CUSTOMISED && !f.flavourOther.trim()) e.flavourOther = 'Tell us the flavour';
  if (f.words.length > WORDS_MAX) e.words = `Keep it under ${WORDS_MAX} characters`;
  if (!f.date) e.date = 'Pick a date';
  else if (f.date < earliest) e.date = 'Custom cakes need a week';
  return e;
}

const labelFor = (list: Option[], id: string, other: string) => {
  if (!id) return '';
  if (id === CUSTOMISED) return other.trim() || 'Customised';
  return list.find((o) => o.id === id)?.label ?? '';
};

export type SummaryRow = { step: StepId; label: string; value: string };

/** The six answers as rows. Empty values mean "not answered yet". */
export function customSummary(f: CustomForm): SummaryRow[] {
  const size = SIZES.find((s) => s.id === f.serves);
  const people = f.serves === CUSTOMISED ? f.servesOther.trim() || 'Customised' : size ? `${size.label} · ${size.size}` : '';
  return [
    { step: 'occasion', label: 'Occasion', value: labelFor(OCCASIONS, f.occasion, f.occasionOther) },
    { step: 'serves', label: 'People', value: people },
    { step: 'look', label: 'Look', value: labelFor(LOOKS, f.look, f.lookOther) },
    { step: 'flavour', label: 'Flavour', value: labelFor(FLAVOURS, f.flavour, f.flavourOther) },
    { step: 'words', label: 'Words', value: f.noWords ? 'No words' : f.words.trim() },
    { step: 'date', label: 'Date', value: f.date },
  ];
}

/** The ticket photo: the chosen look, or the custom-cake sketch before a look is picked. */
export function ticketImage(f: CustomForm): Media {
  return LOOKS.find((l) => l.id === f.look)?.image ?? media.looks.custom;
}

/** The answers as plain strings, for the enquiry log. */
export function customAnswers(f: CustomForm): Record<string, string> {
  return { ...f, noWords: f.noWords ? 'yes' : '' };
}
