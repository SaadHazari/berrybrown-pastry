import { describe, expect, it } from 'vitest';
import { parseStripeSignature, verifyStripeSignature } from './stripeSignature';

// HMAC-SHA256("1790000000." + payload, "whsec_test_secret"), computed once with Node's crypto.
const secret = 'whsec_test_secret';
const payload = '{"id":"evt_1","type":"checkout.session.completed"}';
const t = 1_790_000_000;
const good = 't=' + t + ',v1=081916dffe60d5d7ed5cde3427cc5da76a2e156f4f24d544a5363c4f5f8dac54';

describe('stripe signature', () => {
  it('parses the header', () => {
    expect(parseStripeSignature('t=1700000000,v1=abc,v0=old')).toEqual({ t: 1700000000, v1: ['abc'] });
    expect(parseStripeSignature('nonsense')).toBeNull();
  });

  it('accepts a fresh, correctly signed payload', async () => {
    expect(await verifyStripeSignature(payload, good, secret, t + 10)).toBe(true);
  });

  it('rejects a bad secret, a changed body, an old timestamp and a missing header', async () => {
    expect(await verifyStripeSignature(payload, good, 'whsec_other', t + 10)).toBe(false);
    expect(await verifyStripeSignature(payload + ' ', good, secret, t + 10)).toBe(false);
    expect(await verifyStripeSignature(payload, good, secret, t + 600)).toBe(false);
    expect(await verifyStripeSignature(payload, null, secret, t)).toBe(false);
    expect(await verifyStripeSignature(payload, good.replace(/.$/, '0'), secret, t)).toBe(false);
  });
});
