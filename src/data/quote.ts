import { addDays, localIso, shortDate } from '../lib/dates';
import { BOX, EVENTS, WORKSHOP, type QuoteAbout } from './companies';

export type QuoteForm = {
  /** Boxes, or people, as typed. */
  qty: string;
  boxSize: string;
  logo: '' | 'yes' | 'no';
  where: '' | 'venue' | 'kitchen';
  format: '' | 'session' | 'table';
  date: string;
  area: string;
  company: string;
  name: string;
};

export const EMPTY_QUOTE: QuoteForm = { qty: '', boxSize: '', logo: '', where: '', format: '', date: '', area: '', company: '', name: '' };

export type QuoteErrors = Partial<Record<keyof QuoteForm, string>>;

function leadDays(about: QuoteAbout, f: QuoteForm): number {
  if (about === 'box') return f.logo === 'yes' ? BOX.brandedDays : BOX.plainDays;
  return about === 'workshop' ? WORKSHOP.leadDays : EVENTS.leadDays;
}

export function earliestQuoteDate(about: QuoteAbout, f: QuoteForm, now: Date = new Date()): string {
  return localIso(addDays(now, leadDays(about, f)));
}

/** A trimmed whole number, or null. "20 boxes" and "2.5" are null. */
function count(qty: string): number | null {
  const t = qty.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

export function validateQuote(about: QuoteAbout, f: QuoteForm, now: Date = new Date()): QuoteErrors {
  const e: QuoteErrors = {};
  const n = count(f.qty);
  if (about === 'box') {
    if (!f.boxSize) e.boxSize = 'Pick a box size';
    if (!f.logo) e.logo = 'Pick yes or no';
    if (n === null || n < BOX.minBoxes) e.qty = `The minimum is ${BOX.minBoxes} boxes`;
    else if (f.logo === 'yes' && n < BOX.minBranded) e.qty = `Your logo needs ${BOX.minBranded} boxes or more`;
  } else if (about === 'workshop') {
    if (!f.where) e.where = 'Pick a place';
    if (n === null || n < WORKSHOP.minSeats) e.qty = `The minimum is ${WORKSHOP.minSeats} people`;
  } else {
    const fmt = EVENTS.formats.find((x) => x.id === f.format);
    if (!fmt) e.format = 'Pick one';
    else if (n === null || n < fmt.min || n > fmt.max) e.qty = `${fmt.title} is for ${fmt.min}–${fmt.max} ${fmt.unit}`;
    if (!f.area.trim()) e.area = 'Tell us the office area';
  }
  const earliest = earliestQuoteDate(about, f, now);
  if (!f.date) e.date = 'Pick a date';
  else if (f.date < earliest) e.date = `The earliest date is ${shortDate(earliest)}`;
  if (!f.name.trim()) e.name = 'Tell us your name';
  return e;
}

/** The answers as plain strings, for the enquiry log. */
export const quoteAnswers = (f: QuoteForm): Record<string, string> => ({ ...f });
