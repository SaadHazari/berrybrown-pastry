import { LOG_MEDIA, media, type Media } from './media';

export const CONTACT = {
  whatsapp: '971547944882',
  phoneDisplay: '+971 54 794 4882',
  email: 'connect@berrybrown.me',
  /** Saad to confirm the handle. Blank shows "From the studio" with no links. */
  instagram: '',
  /** The Udora shop link. Blank shows "Coming soon to Udora". */
  udora: '',
  /** Saad to confirm the pickup / studio wording. */
  location: 'Dubai',
  hours: 'Every day · 9am – 9pm',
  legal: 'Berry Brown is a trading name of Dormers Restaurant L.L.C., Dubai. Trade licence 1433956. Not registered for VAT.',
};

/** Shown under the Six and in the footer while the photos are AI-made stand-ins. */
export const PHOTO_NOTE = 'Photos show the style. Each cake is made by hand, so yours will look a little different.';

/** SAMPLE rating — Saad swaps in the real one. */
export const RATING = { score: 4.9, count: 260, sample: true };

export type Stat = { value: number; suffix: string; label: string; sample: boolean };

/** SAMPLE stats — they count up once in view. Saad swaps in the real ones. */
export const STATS: Stat[] = [
  { value: 12, suffix: '', label: 'years', sample: true },
  { value: 3400, suffix: '+', label: 'cakes', sample: true },
  { value: 100, suffix: '%', label: 'from scratch', sample: true },
];

export type Review = { name: string; area: string; text: string; cake: string; sample: boolean };

/** SAMPLE reviews — replace with real ones (with permission) when Saad sends them. */
export const REVIEWS: Review[] = [
  {
    name: 'Reem A.',
    area: 'Emirates Hills',
    text: 'The drip cake was gone in ten minutes. Not too sweet, just right. The kids are still talking about it.',
    cake: 'Berry Chocolate Drip',
    sample: true,
  },
  {
    name: 'Maya & Alex',
    area: 'Palm Jumeirah',
    text: 'They made our wedding cake and it tasted even better than it looked. Every guest asked where it came from.',
    cake: 'Custom wedding cake',
    sample: true,
  },
  {
    name: 'Fatima H.',
    area: 'Downtown',
    text: 'The pistachio kunafa is a dream. It arrived cold and perfect in the middle of August.',
    cake: 'Pistachio Kunafa',
    sample: true,
  },
  {
    name: 'Omar K.',
    area: 'Dubai Hills',
    text: 'Ordered at night, cake at the door the next evening. Easy, friendly and very good.',
    cake: 'Blueberry Cheesecake',
    sample: true,
  },
  {
    name: 'Sara M.',
    area: 'JVC',
    text: 'Like a cake your favourite aunt would make, but prettier. We order every birthday now.',
    cake: 'Berry Cream Sponge',
    sample: true,
  },
];

export const FAQS = [
  { q: 'How early should I order?', a: 'The Six need 24 hours. Custom cakes need a week. Gift boxes need 3–5 days, or 2–3 weeks with your logo.' },
  { q: 'How do cakes survive the Dubai heat?', a: 'Every cake travels with ice packs in an insulated box. Keep it in the fridge until about 15 minutes before serving.' },
  { q: 'Is everything Halal?', a: 'Yes. We never use gelatin. Creams are set with fruit pectin or agar instead.' },
  { q: 'Can I add a message?', a: 'Yes. Every cake can carry a hand-piped message of up to 35 characters.' },
  { q: 'How do I pay?', a: 'Pay online by card or Apple Pay, or send your order on WhatsApp and pay by bank transfer or cash on delivery.' },
  { q: 'Do you deliver?', a: 'Yes, anywhere in Dubai for AED 20. Orders over AED 300 travel free. You can also collect from us.' },
  { q: 'Do you do corporate orders?', a: 'Yes. Gift boxes from 20, workshops from 12 people, and events for up to 60 guests. Tap Get a quote and we reply with a price and an invoice.' },
  { q: 'How do deposits work?', a: 'Custom cakes and gift boxes are confirmed with a 50% deposit. The rest is due before delivery. Workshops and events are paid in full to book.' },
  { q: 'Can I cancel?', a: 'Yes, with 48 hours’ notice. After that we keep the deposit.' },
];

export type LogEntry = { n: number; for: string; flavour: string; size: string; image: Media; sample: boolean };

/** The log — numbered real cakes, newest first. SAMPLE entries until real cakes exist. */
export const LOG: LogEntry[] = [
  { n: 41, for: "for Ayesha's dad, 60th", flavour: 'Classic chocolate', size: '8"', image: LOG_MEDIA[0], sample: true },
  { n: 40, for: 'for a baby shower in Jumeirah', flavour: 'Berry cream sponge', size: '6"', image: LOG_MEDIA[1], sample: true },
  { n: 39, for: "for Lina and Omar's engagement", flavour: 'Pistachio kunafa', size: '8"', image: LOG_MEDIA[2], sample: true },
];

export const cakeNumber = (n: number) => `#${String(n).padStart(3, '0')}`;


export type Step = { n: string; title: string; text: string; image: Media };

export const STEPS: Step[] = [
  { n: '01', title: 'Pick your cake', text: 'Choose one of the Six, or design your own.', image: media.how[0] },
  { n: '02', title: 'Choose a day', text: 'We bake to order. The Six need 24 hours, custom cakes a week.', image: media.how[1] },
  { n: '03', title: 'We bring it chilled', text: 'In an insulated box, anywhere in Dubai. Or collect it from us.', image: media.how[2] },
];

export type GalleryItem = { image: Media; caption: string; tall: boolean };

export const GALLERY: GalleryItem[] = [
  { image: media.kitchen.layers, caption: 'Berry layers', tall: true },
  { image: media.kitchen.crumb, caption: 'The crumb', tall: false },
  { image: media.kitchen.cocoa, caption: 'Cocoa', tall: true },
  { image: media.six[1], caption: 'Pistachio kunafa', tall: true },
  { image: media.kitchen.packing, caption: 'Packed by hand', tall: false },
  { image: media.kitchen.flowers, caption: 'Fresh flowers', tall: true },
];
