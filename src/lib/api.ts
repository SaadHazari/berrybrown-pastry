import type { LineInput } from './pricing';
import type { Customer } from './order';

export type CheckoutRequest = {
  ref: string;
  lines: LineInput[];
  zoneId: string;
  date: string;
  slotId: string;
  customer: Customer;
};

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly unavailable = false,
  ) {
    super(message);
  }
}

export async function createCheckoutSession(body: CheckoutRequest): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CheckoutError('We could not reach the payment page. Check your connection and try again.');
  }
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (res.ok && data.url) return data.url;
  // 404 = function not deployed (e.g. local dev), 503 = Stripe not configured
  const unavailable = res.status === 404 || res.status === 503;
  throw new CheckoutError(
    unavailable ? 'Online payment is not available right now. You can still send your order on WhatsApp.' : (data.error ?? 'Something went wrong starting payment.'),
    unavailable,
  );
}

/**
 * Uploads inspiration photos for the custom-cake form and returns their public URLs.
 * Throws on any failure — the caller falls back to "I'll send my photos here" (route B).
 */
export async function uploadInspiration(files: File[]): Promise<string[]> {
  const form = new FormData();
  for (const f of files) form.append('files', f, f.name);
  const res = await fetch('/api/inspiration', { method: 'POST', body: form });
  const data = (await res.json().catch(() => ({}))) as { urls?: string[]; error?: string };
  if (!res.ok || !data.urls?.length) throw new Error(data.error ?? `Upload failed (${res.status})`);
  return data.urls;
}
