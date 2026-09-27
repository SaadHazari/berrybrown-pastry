/**
 * Key scheme for inspiration photos in R2: `<ip-hash 12 hex>/<epoch ms 13 digits>-<16 hex>.<ext>`.
 * Pure helpers shared by the Worker and the tests.
 */
export const INSPIRATION_PATH = '/api/inspiration';
export const MAX_FILES = 3;
export const MAX_BYTES = 10 * 1024 * 1024;
export const RATE_LIMIT_PER_HOUR = 10;
const HOUR_MS = 3_600_000;

const KEY = /^([a-f0-9]{12})\/(\d{13})-([a-f0-9]{16})\.(jpg|png|webp|heic)$/;

export function isInspirationKey(key: string): boolean {
  return KEY.test(key);
}

export function inspirationKey(ipHash: string, now: number, rand16: string, ext: string): string {
  return `${ipHash}/${String(now).padStart(13, '0')}-${rand16}.${ext}`;
}

export function keyTime(key: string): number | null {
  const m = KEY.exec(key);
  return m ? Number(m[2]) : null;
}

/** How many of these keys were written in the last hour. */
export function countRecent(keys: string[], now: number): number {
  return keys.filter((k) => {
    const t = keyTime(k);
    return t !== null && now - t < HOUR_MS;
  }).length;
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
