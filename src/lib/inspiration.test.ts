import { describe, expect, it } from 'vitest';
import { hashIp, inspirationKey, randomHex16 } from './inspiration';

describe('inspiration paths', () => {
  it('builds a safe storage path', () => {
    expect(inspirationKey('abcdef012345', 1_790_000_000_000, '0123456789abcdef', 'jpg')).toBe('abcdef012345/1790000000000-0123456789abcdef.jpg');
  });

  it('hashes IPs to 12 hex characters, deterministically', async () => {
    const a = await hashIp('1.2.3.4');
    expect(a).toMatch(/^[a-f0-9]{12}$/);
    expect(await hashIp('1.2.3.4')).toBe(a);
    expect(await hashIp('1.2.3.5')).not.toBe(a);
    expect(randomHex16()).toMatch(/^[a-f0-9]{16}$/);
  });
});
