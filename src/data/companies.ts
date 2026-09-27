import { localIso, shortDate } from '../lib/dates';
import { media, type Media } from './media';

export type QuoteAbout = 'box' | 'workshop' | 'event';
export const isQuoteAbout = (v: string | null): v is QuoteAbout => v === 'box' || v === 'workshop' || v === 'event';

export type BoxSize = { id: string; pieces: number; price: number };
const BOX_SIZES: BoxSize[] = [
  { id: '6', pieces: 6, price: 65 },
  { id: '8', pieces: 8, price: 90 },
  { id: '10', pieces: 10, price: 120 },
];

/** The Box — revenue brief channel 6. */
export const BOX = {
  sizes: BOX_SIZES,
  minBoxes: 20,
  minBranded: 50,
  /** Plain boxes take 3–5 days and branded 2–3 weeks; the form uses the long end. */
  plainDays: 5,
  brandedDays: 21,
  facts: ['Min 20 boxes', 'Your logo from 50', 'Ready in 3–5 days', '2–3 weeks with your logo', 'We invoice your company'],
};

export type WorkshopPlace = { id: 'venue' | 'kitchen'; label: string; from: number };
const PLACES: WorkshopPlace[] = [
  { id: 'venue', label: 'At your venue', from: 150 },
  { id: 'kitchen', label: 'At a kitchen we book', from: 200 },
];

/** Make one with us — revenue brief channel 3. */
export const WORKSHOP = {
  places: PLACES,
  minSeats: 12,
  leadDays: 7,
  facts: ['12 seats minimum', 'One cake each', '90 minutes', 'Paid in full to book'],
};

export type EventFormat = { id: 'session' | 'table'; title: string; text: string; price: string; min: number; max: number; unit: string; image: Media };
const FORMATS: EventFormat[] = [
  { id: 'session', title: 'The decorating session', text: '90 minutes in your office. Each person decorates a cake and takes it home.', price: 'AED 175–250 a person · 12–20 people', min: 12, max: 20, unit: 'people', image: media.events.session },
  { id: 'table', title: 'The Table', text: 'Minis of the Six for 40–60 guests. We set up, serve and clear.', price: 'AED 35–70 a guest · 40–60 guests', min: 40, max: 60, unit: 'guests', image: media.events.table },
];

/** Corporate events — revenue brief channel 5. */
export const EVENTS = {
  formats: FORMATS,
  leadDays: 7,
  facts: ['Paid in advance', 'Final headcount 72 hours before', 'You pay for the number booked'],
};

export const QUOTE_INFO: Record<QuoteAbout, { name: string; price: string; facts: string[]; subject: string }> = {
  box: { name: 'Gift boxes', price: 'From AED 65 a box · min 20', facts: BOX.facts, subject: 'Gift boxes' },
  workshop: { name: 'Workshops', price: 'From AED 150 a seat · 12 seats', facts: WORKSHOP.facts, subject: 'Workshop' },
  event: { name: 'Company events', price: 'From AED 35 a guest', facts: EVENTS.facts, subject: 'Company event' },
};

export type Deadline = { label: string; branded?: string; plain?: string; date?: string };

/** Gift-box order-by dates (revenue brief, 27 Sep). Dates that have passed hide themselves. */
export const DEADLINES: Deadline[] = [
  { label: 'Diwali', branded: '2026-10-20', plain: '2026-10-28' },
  { label: 'National Day', date: '2026-11-10' },
  { label: 'Year-end', branded: '2026-11-27', plain: '2026-12-03' },
];

const openDates = (d: Deadline, today: string) => [d.branded, d.date, d.plain].filter((x): x is string => !!x && x >= today).sort();

export function upcomingDeadlines(now: Date = new Date()): Deadline[] {
  const today = localIso(now);
  return DEADLINES.filter((d) => openDates(d, today).length > 0);
}

/** "Diwali · 20 Oct with your logo, 28 Oct plain" — only the dates still open. */
export function deadlineLine(d: Deadline, now: Date = new Date()): string {
  if (d.date) return `${d.label} · ${shortDate(d.date)}`;
  const today = localIso(now);
  const parts: string[] = [];
  if (d.branded && d.branded >= today) parts.push(`${shortDate(d.branded)} with your logo`);
  if (d.plain && d.plain >= today) parts.push(`${shortDate(d.plain)} plain`);
  return `${d.label} · ${parts.join(', ')}`;
}

/** The deadline strip: the soonest date that is still open. */
export function nextDeadline(now: Date = new Date()): { label: string; date: string } | null {
  const today = localIso(now);
  for (const d of DEADLINES) {
    const dates = openDates(d, today);
    if (dates.length) return { label: d.label, date: dates[0] };
  }
  return null;
}
