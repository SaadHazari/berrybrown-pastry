import { CONTACT } from '../data/content';
import { BOX, EVENTS, WORKSHOP, type QuoteAbout } from '../data/companies';
import type { QuoteForm } from '../data/quote';
import { CUSTOMISED, CUSTOM_FLAVOUR_ADD, customFromPrice, customSummary, type CustomForm } from '../data/custom';
import { TIME_SLOTS, getZone } from '../data/zones';
import { aed, prettyDate } from './format';
import { resolveLine, totals, type LineInput } from './pricing';

/** Every message opens by greeting the studio, never a person. */
export const GREETING = 'Hi Berry Brown,';
export const GENERAL_MESSAGE = `${GREETING} I have a question about a cake.`;

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
    `${GREETING} ${o.paid ? 'I just paid online for' : "I'd like to order"}:`,
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
 * The message for a custom cake. `photoUrls` are links from the inspiration upload; `unsentPhotos` > 0 means
 * the upload failed and the customer will attach the photos in WhatsApp instead.
 */
export function customCakeMessage(f: CustomForm, photoUrls: string[] = [], unsentPhotos = 0): string {
  const rows = customSummary(f);
  const value = (label: string) => rows.find((r) => r.label === label)?.value ?? '';
  const words = f.words.trim();
  return tidy([
    `${GREETING} I'd like a custom cake.`,
    '',
    `Occasion: ${value('Occasion')}`,
    `People: ${value('People')}`,
    `Look: ${value('Look')}`,
    `Flavour: ${value('Flavour')}${f.flavour === CUSTOMISED ? ` (+AED ${CUSTOM_FLAVOUR_ADD})` : ''}`,
    f.noWords || !words ? 'Words on the cake: none' : `Words on the cake: "${words}"`,
    `Date: ${f.date ? prettyDate(f.date) : ''}`,
    `From ${aed(customFromPrice(f))} on the site`,
    '',
    ...photoUrls.map((u) => `Inspiration: ${u}`),
    unsentPhotos > 0 ? "I'll send my inspiration photos here." : '',
  ]);
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** A mailto link to the studio. */
export function mailtoLink(subject: string, body = ''): string {
  const query = [`subject=${encodeURIComponent(subject)}`, body ? `body=${encodeURIComponent(body)}` : ''].filter(Boolean).join('&');
  return `mailto:${CONTACT.email}?${query}`;
}

/** The WhatsApp or email text behind "Get a quote". Optional lines are left out when empty. */
export function quoteMessage(about: QuoteAbout, f: QuoteForm): string {
  const when = f.date ? prettyDate(f.date) : '';
  const company = f.company.trim();
  const lines: string[] = [];
  if (about === 'box') {
    const size = BOX.sizes.find((s) => s.id === f.boxSize);
    lines.push(`${GREETING} I'd like a quote for gift boxes.`, '', `Boxes: ${f.qty.trim()}`);
    if (size) lines.push(`Box: ${size.pieces} pieces, AED ${size.price} each`);
    lines.push(`Our logo on the sleeve: ${f.logo === 'yes' ? 'yes' : 'no'}`, `Deliver by: ${when}`);
    if (company) lines.push(`Company: ${company}`);
  } else if (about === 'workshop') {
    const place = WORKSHOP.places.find((p) => p.id === f.where);
    lines.push(`${GREETING} I'd like a quote for a workshop.`, '', `Date: ${when}`);
    if (place) lines.push(`Where: ${place.label.toLowerCase()}`);
    lines.push(`People: ${f.qty.trim()}`);
    if (company) lines.push(`Group: ${company}`);
  } else {
    const fmt = EVENTS.formats.find((x) => x.id === f.format);
    lines.push(`${GREETING} I'd like a quote for a company event.`, '');
    if (fmt) lines.push(`Event: ${fmt.title}`);
    lines.push(`Date: ${when}`, `People: ${f.qty.trim()}`, `Office area: ${f.area.trim()}`);
    if (company) lines.push(`Company: ${company}`);
  }
  lines.push(`Name: ${f.name.trim()}`);
  return lines.join('\n');
}
