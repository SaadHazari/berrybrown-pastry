/**
 * Inspiration photos: storage paths and limits. Pure helpers shared by the Worker and the tests.
 * Path scheme in the private "inspiration" bucket: `<ip-hash 12 hex>/<epoch ms>-<16 hex>.<ext>`.
 */
export const INSPIRATION_PATH = '/api/inspiration';
export const MAX_FILES = 3;
export const MAX_BYTES = 10 * 1024 * 1024;
export const RATE_LIMIT_PER_HOUR = 10;
/** Links in the WhatsApp message stay valid for 30 days. */
export const SIGNED_URL_SECONDS = 30 * 24 * 3600;

export function inspirationKey(ipHash: string, now: number, rand16: string, ext: string): string {
  return `${ipHash}/${String(now).padStart(13, '0')}-${rand16}.${ext}`;
}

export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`berrybrown-inspiration:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest).subarray(0, 6))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function randomHex16(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
