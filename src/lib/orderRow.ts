/**
 * Turns a validated order into the row the Worker writes to Supabase `orders`.
 * Names are copied into `lines` so the row stays readable if the catalogue changes.
 */
import { TIME_SLOTS, getZone } from '../data/zones';
import type { ValidOrder } from './checkoutRequest';
import { resolveLine, totals } from './pricing';

export type OrderChannel = 'online' | 'whatsapp';

export type OrderLineRow = {
  productId: string;
  sizeId: string;
  flavourId: string;
  qty: number;
  message?: string;
  product: string;
  size: string;
  flavour: string;
  unit: number;
};

export type OrderRow = {
  ref: string;
  channel: OrderChannel;
  status: 'pending';
  fulfilment: 'delivery' | 'pickup';
  date: string;
  slot: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string | null;
  notes: string | null;
  lines: OrderLineRow[];
  subtotal: number;
  delivery: number;
  total: number;
  stripe_session_id: string | null;
};

export function orderRow(order: ValidOrder, channel: OrderChannel, stripeSessionId: string | null = null): OrderRow {
  const zone = getZone(order.zoneId);
  const t = totals(order.lines, order.zoneId);
  return {
    ref: order.ref,
    channel,
    status: 'pending',
    fulfilment: zone?.pickup ? 'pickup' : 'delivery',
    date: order.date,
    slot: TIME_SLOTS.find((s) => s.id === order.slotId)?.label ?? order.slotId,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email || null,
    address: zone?.pickup ? null : order.customer.address || null,
    notes: order.customer.notes || null,
    lines: order.lines.map((l) => {
      const { product, size, flavour } = resolveLine(l);
      return {
        productId: l.productId,
        sizeId: l.sizeId,
        flavourId: l.flavourId,
        qty: l.qty,
        message: l.message,
        product: product.name,
        size: size.label,
        flavour: flavour.name,
        unit: size.price,
      };
    }),
    subtotal: t.subtotal,
    delivery: t.delivery,
    total: t.total,
    stripe_session_id: stripeSessionId,
  };
}
