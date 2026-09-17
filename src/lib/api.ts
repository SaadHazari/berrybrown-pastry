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
    unavailable ? 'Online payment is taking a little break. You can still send your order on WhatsApp.' : (data.error ?? 'Something went wrong starting payment.'),
    unavailable,
  );
}
