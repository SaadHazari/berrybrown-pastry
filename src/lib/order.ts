import { CONTACT, OFFERS, type OfferId } from '../data/content';
import { customFromPrice, customSummary, serveOption, type CustomForm } from '../data/custom';
import { TIME_SLOTS, getZone } from '../data/zones';
import { aed, prettyDate } from './format';
import { resolveLine, totals, type LineInput } from './pricing';

export type Customer = { name: string; phone: string; email: string; address: string; notes: string };

export type OrderSummary = {
  ref: string;
  lines: LineInput[];
  zoneId: string;
  date: string;
  slotId: string;
  customer: Customer;
  paid: boolean;
};

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function orderRef(now: Date = new Date(), rand: () => number = Math.random): string {
  const d = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const tail = Array.from({ length: 4 }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]).join('');
  return `BB-${d}-${tail}`;
}

const tidy = (lines: string[]) => lines.filter((line, i, arr) => line !== '' || arr[i - 1] !== '').join('\n');

/** The message a customer sends for a bag of the Six. */
export function whatsappOrderText(o: OrderSummary): string {
  const zone = getZone(o.zoneId);
  const slot = TIME_SLOTS.find((s) => s.id === o.slotId)?.label ?? o.slotId;
  const t = totals(o.lines, o.zoneId);
  const items = o.lines.map((l) => {
    const { product, size, flavour } = resolveLine(l);
    const msg = l.message ? `\n   Message: "${l.message}"` : '';
    return `• ${l.qty} × ${product.name} — ${size.label}, ${flavour.name} — ${aed(size.price * l.qty)}${msg}`;
  });
  return tidy([
    `Hi Safa, ${o.paid ? 'I just paid online for' : "I'd like to order"}:`,
    '',
    ...items,
    '',
    `${zone?.pickup ? 'Pickup' : `Delivery to ${zone?.name}`} — ${prettyDate(o.date)}, ${slot}`,
    zone?.pickup ? '' : `Address: ${o.customer.address}`,
    `Name: ${o.customer.name} · ${o.customer.phone}`,
    o.customer.notes ? `Notes: ${o.customer.notes}` : '',
    '',
    `Subtotal: ${aed(t.subtotal)}`,
    `Delivery: ${t.delivery ? aed(t.delivery) : 'Free'}`,
    `Total: ${aed(t.total)}${o.paid ? ' (paid)' : ''}`,
    `Ref: ${o.ref}`,
  ]);
}

/**
 * The message for a custom cake (§4.3).
 * `photoUrls` are links from the inspiration upload; `unsentPhotos` > 0 means the upload
 * failed and the customer will attach the photos in WhatsApp instead (route B).
 */
export function customCakeMessage(f: CustomForm, photoUrls: string[] = [], unsentPhotos = 0): string {
  const rows = customSummary(f);
  const serve = serveOption(f.serves);
  const value = (label: string) => rows.find((r) => r.label === label)?.value ?? '';
  return tidy([
    "Hi Safa, I'd like a custom cake.",
    '',
    `Occasion: ${value('Occasion')}`,
    `People: ${value('People')}${serve?.note ? ' (quoted separately)' : ''}`,
    `Look: ${value('Look')}`,
    `Flavour: ${value('Flavour')}`,
    f.words.trim() ? `Words on the cake: "${f.words.trim()}"` : '',
    `Date: ${f.date ? prettyDate(f.date) : ''}`,
    `From ${aed(customFromPrice(f))} on the site`,
    '',
    ...photoUrls.map((u) => `Inspiration: ${u}`),
    unsentPhotos > 0 ? "I'll send my inspiration photos here." : '',
  ]);
}

/** The message behind ENQUIRE in "For companies and events" (§4.6). */
export function enquiryMessage(about: OfferId | null): string {
  const offer = about ? OFFERS.find((o) => o.id === about) : undefined;
  return tidy([
    offer ? `Hi Safa, I'd like to ask about ${offer.title}.` : "Hi Safa, I'd like to ask about an order for my company.",
    '',
    'Company:',
    'Date:',
    'Headcount:',
  ]);
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}
