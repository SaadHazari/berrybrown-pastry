import { CONTACT } from '../data/content';
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

export function whatsappOrderText(o: OrderSummary): string {
  const zone = getZone(o.zoneId);
  const slot = TIME_SLOTS.find((s) => s.id === o.slotId)?.label ?? o.slotId;
  const t = totals(o.lines, o.zoneId);
  const items = o.lines.map((l) => {
    const { product, size, flavour } = resolveLine(l);
    const msg = l.message ? `\n   ✍️ "${l.message}"` : '';
    return `• ${l.qty} × ${product.name} — ${size.label}, ${flavour.name} — ${aed(size.price * l.qty)}${msg}`;
  });
  return [
    `Hi Safa! 🍰 ${o.paid ? 'I just paid online for' : "I'd like to order"}:`,
    '',
    ...items,
    '',
    `${zone?.pickup ? '🏠 Pickup' : `🚚 Delivery to ${zone?.name}`} — ${prettyDate(o.date)}, ${slot}`,
    zone?.pickup ? '' : `📍 ${o.customer.address}`,
    `👤 ${o.customer.name} · ${o.customer.phone}`,
    o.customer.notes ? `📝 ${o.customer.notes}` : '',
    '',
    `Subtotal: ${aed(t.subtotal)}`,
    `Delivery: ${t.delivery ? aed(t.delivery) : 'Free'}`,
    `Total: ${aed(t.total)}${o.paid ? ' (paid ✅)' : ''}`,
    `Ref: ${o.ref}`,
  ]
    .filter((line, i, arr) => line !== '' || arr[i - 1] !== '')
    .join('\n');
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}
