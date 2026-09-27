/**
 * Decides what a Stripe webhook event means for Berry Brown — pure, so it is testable.
 * The Dormers Stripe account also carries Dormers events; anything without our brand
 * metadata (or without a Berry Brown reference) is ignored.
 */
export const BRAND = 'berry_brown';
export const APPLICATION = 'berry_brown_web';
export const REF_PATTERN = /^BB-\d{6}-[A-Z0-9]{4}$/;

export type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      object?: string;
      client_reference_id?: string | null;
      payment_intent?: string | null;
      amount_total?: number | null;
      amount?: number | null;
      amount_refunded?: number | null;
      currency?: string | null;
      metadata?: Record<string, string> | null;
    };
  };
};

export type WebhookAction =
  | { kind: 'paid'; ref: string; sessionId: string | null; paymentIntentId: string | null; amount: number | null; eventId: string }
  | { kind: 'cancel'; ref: string }
  | { kind: 'refund'; paymentIntentId: string; chargeId: string; amountRefunded: number; fullyRefunded: boolean; eventId: string }
  | { kind: 'ignore'; reason: string };

const isOurs = (meta: Record<string, string> | null | undefined) => meta?.brand === BRAND;

export function webhookAction(event: StripeEvent): WebhookAction {
  const o = event.data?.object ?? {};
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      if (!isOurs(o.metadata)) return { kind: 'ignore', reason: 'not a Berry Brown session' };
      const ref = o.client_reference_id ?? '';
      if (!REF_PATTERN.test(ref)) return { kind: 'ignore', reason: 'no Berry Brown reference' };
      return { kind: 'paid', ref, sessionId: o.id ?? null, paymentIntentId: o.payment_intent ?? null, amount: typeof o.amount_total === 'number' ? Math.round(o.amount_total / 100) : null, eventId: event.id };
    }
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      if (!isOurs(o.metadata)) return { kind: 'ignore', reason: 'not a Berry Brown session' };
      const ref = o.client_reference_id ?? '';
      if (!REF_PATTERN.test(ref)) return { kind: 'ignore', reason: 'no Berry Brown reference' };
      return { kind: 'cancel', ref };
    }
    case 'charge.refunded': {
      // Charges carry the PaymentIntent's metadata; the order lookup by PaymentIntent is the second lock.
      if (!isOurs(o.metadata)) return { kind: 'ignore', reason: 'not a Berry Brown charge' };
      if (!o.payment_intent || !o.id) return { kind: 'ignore', reason: 'charge without payment intent' };
      const refunded = o.amount_refunded ?? 0;
      return { kind: 'refund', paymentIntentId: o.payment_intent, chargeId: o.id, amountRefunded: Math.round(refunded / 100), fullyRefunded: refunded > 0 && refunded >= (o.amount ?? 0), eventId: event.id };
    }
    default:
      return { kind: 'ignore', reason: `unhandled ${event.type}` };
  }
}
