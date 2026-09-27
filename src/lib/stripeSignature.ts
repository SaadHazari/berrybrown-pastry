/**
 * Verifies a Stripe webhook signature (the `Stripe-Signature` header) with Web Crypto.
 * Pure — shared by the Worker and the tests. See https://docs.stripe.com/webhooks#verify-manually
 */
const TOLERANCE_SECONDS = 300;

export function parseStripeSignature(header: string): { t: number; v1: string[] } | null {
  const parts = header.split(',').map((p) => p.trim().split('='));
  const t = Number(parts.find(([k]) => k === 't')?.[1]);
  const v1 = parts.filter(([k]) => k === 'v1').map(([, v]) => v ?? '');
  if (!Number.isFinite(t) || v1.length === 0) return null;
  return { t, v1 };
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when the header signs `payload` with `secret` and is younger than five minutes. */
export async function verifyStripeSignature(payload: string, header: string | null, secret: string, nowSeconds: number = Date.now() / 1000): Promise<boolean> {
  if (!header) return false;
  const parsed = parseStripeSignature(header);
  if (!parsed) return false;
  if (Math.abs(nowSeconds - parsed.t) > TOLERANCE_SECONDS) return false;
  const expected = await hmacHex(secret, `${parsed.t}.${payload}`);
  return parsed.v1.some((v) => timingSafeEqual(v, expected));
}
