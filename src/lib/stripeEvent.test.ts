import { describe, expect, it } from 'vitest';
import { webhookAction, type StripeEvent } from './stripeEvent';

const ev = (type: string, object: StripeEvent['data']['object'], id = 'evt_1'): StripeEvent => ({ id, type, data: { object } });
const ours = { brand: 'berry_brown', application: 'berry_brown_web', order_ref: 'BB-260927-AB12' };

describe('webhookAction (multi-brand guard)', () => {
  it('marks a Berry Brown session paid', () => {
    const a = webhookAction(ev('checkout.session.completed', { id: 'cs_1', client_reference_id: 'BB-260927-AB12', payment_intent: 'pi_1', amount_total: 22000, metadata: ours }));
    expect(a).toEqual({ kind: 'paid', ref: 'BB-260927-AB12', sessionId: 'cs_1', paymentIntentId: 'pi_1', amount: 220, eventId: 'evt_1' });
  });

  it('ignores Dormers sessions on the shared account', () => {
    expect(webhookAction(ev('checkout.session.completed', { id: 'cs_d', client_reference_id: 'DORMERS-1', payment_intent: 'pi_d', metadata: {} })).kind).toBe('ignore');
    expect(webhookAction(ev('checkout.session.completed', { id: 'cs_d', client_reference_id: 'BB-260927-AB12', metadata: { brand: 'dormers' } })).kind).toBe('ignore');
    expect(webhookAction(ev('checkout.session.completed', { id: 'cs_x', client_reference_id: 'nope', metadata: ours })).kind).toBe('ignore');
  });

  it('cancels on expiry or failed async payment, never marks paid', () => {
    expect(webhookAction(ev('checkout.session.expired', { client_reference_id: 'BB-260927-AB12', metadata: ours }))).toEqual({ kind: 'cancel', ref: 'BB-260927-AB12' });
    expect(webhookAction(ev('checkout.session.async_payment_failed', { client_reference_id: 'BB-260927-AB12', metadata: ours })).kind).toBe('cancel');
  });

  it('traces refunds to the payment intent', () => {
    const a = webhookAction(ev('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 22000, amount_refunded: 22000, metadata: ours }, 'evt_r'));
    expect(a).toEqual({ kind: 'refund', paymentIntentId: 'pi_1', chargeId: 'ch_1', amountRefunded: 220, fullyRefunded: true, eventId: 'evt_r' });
    expect(webhookAction(ev('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', amount: 22000, amount_refunded: 5000, metadata: ours }))).toMatchObject({ kind: 'refund', fullyRefunded: false, amountRefunded: 50 });
    expect(webhookAction(ev('charge.refunded', { id: 'ch_d', payment_intent: 'pi_d', amount: 100, amount_refunded: 100, metadata: {} })).kind).toBe('ignore');
  });

  it('ignores everything else', () => {
    expect(webhookAction(ev('payment_intent.created', { metadata: ours })).kind).toBe('ignore');
  });
});
