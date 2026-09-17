import { getProduct } from '../data/products';
import { getZone } from '../data/zones';

export type LineInput = {
  productId: string;
  sizeId: string;
  flavourId: string;
  qty: number;
  message?: string;
};

export const MAX_QTY = 20;
export const MESSAGE_MAX = 35;
/** Orders ready after this hour roll over to the next day (last slot starts at 6pm). */
const LAST_READY_HOUR = 18;

export function resolveLine(l: LineInput) {
  const product = getProduct(l.productId);
  if (!product) throw new Error(`Unknown product: ${l.productId}`);
  const size = product.sizes.find((s) => s.id === l.sizeId);
  if (!size) throw new Error(`Unknown size ${l.sizeId} for ${l.productId}`);
  const flavour = product.flavours.find((f) => f.id === l.flavourId);
  if (!flavour) throw new Error(`Unknown flavour ${l.flavourId} for ${l.productId}`);
  return { product, size, flavour };
}

export function unitPrice(l: LineInput): number {
  return resolveLine(l).size.price;
}

function assertQty(qty: number) {
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw new Error(`Invalid quantity: ${qty}`);
}

export function subtotal(lines: LineInput[]): number {
  return lines.reduce((sum, l) => {
    assertQty(l.qty);
    return sum + unitPrice(l) * l.qty;
  }, 0);
}

export function deliveryFee(sub: number, zoneId: string): number {
  const zone = getZone(zoneId);
  if (!zone) throw new Error(`Unknown zone: ${zoneId}`);
  if (zone.pickup || sub >= zone.freeOver) return 0;
  return zone.fee;
}

export function maxLeadHours(lines: LineInput[]): number {
  return lines.reduce((max, l) => Math.max(max, getProduct(l.productId)?.leadTimeHours ?? 24), 24);
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function earliestDate(lines: LineInput[], now: Date = new Date()): string {
  const ready = new Date(now.getTime() + maxLeadHours(lines) * 3_600_000);
  if (ready.getHours() >= LAST_READY_HOUR) ready.setDate(ready.getDate() + 1);
  return iso(ready);
}

export function totals(lines: LineInput[], zoneId: string) {
  const sub = subtotal(lines);
  const delivery = deliveryFee(sub, zoneId);
  return { subtotal: sub, delivery, total: sub + delivery };
}
