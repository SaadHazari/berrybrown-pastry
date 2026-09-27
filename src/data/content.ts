import { media, type Media } from './media';

export const CONTACT = {
  whatsapp: '971509478943',
  phoneDisplay: '+971 50 947 8943',
  email: 'saad@berrybrown.me',
  /** Saad to confirm the handle. Blank hides the Follow column in the footer. */
  instagram: '',
  /** Saad to confirm the pickup / studio wording. */
  location: 'Dubai',
  hours: 'Every day · 9am – 9pm',
  legal: 'Berry Brown is a trading name of Dormers Restaurant L.L.C., Dubai. Trade licence 1433956. Not registered for VAT.',
};

/** SAMPLE rating — Saad swaps in the real one. */
export const RATING = { score: 4.9, count: 260, sample: true };

/** SAMPLE stats — static Jost numbers, no count-up. */
export const STATS = [
  { value: '12 years', sample: true },
  { value: '3,400+ cakes', sample: true },
  { value: '100% from scratch', sample: true },
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
    text: 'Safa made our wedding cake and it tasted even better than it looked. Every guest asked where it came from.',
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
  {
    q: 'How early should I order?',
    a: 'The Six need 24 hours. Custom cakes need 48 hours. Two tiers need a week.',
  },
  {
    q: 'How do cakes survive the Dubai heat?',
    a: 'Every cake travels with ice packs in an insulated box. Keep it in the fridge until about 15 minutes before serving.',
  },
  {
    q: 'Is everything Halal?',
    a: 'Yes. We never use gelatin. Creams are set with fruit pectin or agar instead.',
  },
  {
    q: 'Can I add a message?',
    a: 'Yes. Every cake can carry a hand-piped message of up to 35 characters.',
  },
  {
    q: 'How do I pay?',
    a: 'Pay online by card or Apple Pay, or send your order on WhatsApp and pay by bank transfer or cash on delivery.',
  },
  {
    q: 'Do you do corporate orders?',
    a: 'Yes. Gift boxes from 20, workshops for up to 12, and dessert tables for 40–60. Send the date and headcount and we reply with a quote and an invoice.',
  },
  {
    q: 'How do deposits work?',
    a: 'Custom cakes, boxes and events are confirmed with a 50% deposit. The rest is due on delivery.',
  },
];

export type LogEntry = { n: number; for: string; flavour: string; size: string; image: Media; sample: boolean };

/** The log — numbered real cakes, newest first. SAMPLE entries until real cakes exist. */
export const LOG: LogEntry[] = [
  { n: 41, for: "for Ayesha's dad, 60th", flavour: 'Classic chocolate', size: '8"', image: media.log[0], sample: true },
  { n: 40, for: 'for a baby shower in Jumeirah', flavour: 'Berry cream sponge', size: '6"', image: media.log[1], sample: true },
  { n: 39, for: "for Lina and Omar's engagement", flavour: 'Pistachio kunafa', size: '8"', image: media.log[2], sample: true },
];

export const cakeNumber = (n: number) => `#${String(n).padStart(3, '0')}`;

export type OfferId = 'box' | 'workshop' | 'table';
export type Offer = { id: OfferId; title: string; text: string; price: string; icon: string };

export const OFFERS: Offer[] = [
  {
    id: 'box',
    title: 'The Box',
    text: 'Brownies and cookies in a branded sleeve with a hand-written card. Your logo on the sleeve from 50 boxes.',
    price: '6 pc 65 · 8 pc 90 · 10 pc 120 · min 20',
    icon: '/brand/berrybrown-circle-cocoa.svg',
  },
  {
    id: 'workshop',
    title: 'Make one with Safa',
    text: 'A 90-minute decorating workshop at your venue. Twelve seats, one cake each.',
    price: 'From 150 per seat · 12 seats',
    icon: '/brand/berrybrown-circle-rose.svg',
  },
  {
    id: 'table',
    title: 'The Table',
    text: 'Minis of the Six for 40–60 guests. Set up, served, cleared.',
    price: 'From 35 per head',
    icon: '/brand/berrybrown-circle-cocoa.svg',
  },
];

export const isOfferId = (v: string | null): v is OfferId => v === 'box' || v === 'workshop' || v === 'table';

export type Deadline = { label: string; date: string };

/** Corporate order deadlines. Past dates are hidden automatically. */
export const DEADLINES: Deadline[] = [
  { label: 'Diwali boxes close', date: '2026-10-20' },
  { label: 'National Day', date: '2026-11-10' },
  { label: 'Year-end', date: '2026-11-27' },
];

const localIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function upcomingDeadlines(now: Date = new Date()): Deadline[] {
  const today = localIso(now);
  return DEADLINES.filter((d) => d.date >= today);
}

export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
