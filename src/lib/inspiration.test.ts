import { describe, expect, it } from 'vitest';
import { countRecent, hashIp, inspirationKey, isInspirationKey, keyTime, randomHex16 } from './inspiration';

describe('inspiration keys', () => {
  const ip = 'abcdef012345';
  const now = 1_790_000_000_000;

  it('builds and recognises keys', () => {
    const key = inspirationKey(ip, now, '0123456789abcdef', 'jpg');
    expect(key).toBe('abcdef012345/1790000000000-0123456789abcdef.jpg');
    expect(isInspirationKey(key)).toBe(true);
    expect(keyTime(key)).toBe(now);
    expect(isInspirationKey('../etc/passwd')).toBe(false);
    expect(isInspirationKey('abcdef012345/1790000000000-0123456789abcdef.svg')).toBe(false);
  });

  it('counts only the last hour', () => {
    const keys = [
      inspirationKey(ip, now - 10_000, '0123456789abcdef', 'jpg'),
      inspirationKey(ip, now - 3_599_000, '0123456789abcdef', 'png'),
      inspirationKey(ip, now - 3_601_000, '0123456789abcdef', 'heic'),
      'garbage',
    ];
    expect(countRecent(keys, now)).toBe(2);
  });

  it('hashes IPs to 12 hex characters, deterministically', async () => {
    const a = await hashIp('1.2.3.4');
    expect(a).toMatch(/^[a-f0-9]{12}$/);
    expect(await hashIp('1.2.3.4')).toBe(a);
    expect(await hashIp('1.2.3.5')).not.toBe(a);
    expect(randomHex16()).toMatch(/^[a-f0-9]{16}$/);
  });
});
