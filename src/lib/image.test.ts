import { describe, expect, it } from 'vitest';
import { sniffImage } from './image';

const bytes = (...b: (number | string)[]) => {
  const out: number[] = [];
  for (const x of b) {
    if (typeof x === 'string') out.push(...x.split('').map((c) => c.charCodeAt(0)));
    else out.push(x);
  }
  while (out.length < 16) out.push(0);
  return new Uint8Array(out);
};

describe('sniffImage', () => {
  it('recognises JPG, PNG, WebP and HEIC by their bytes, not their name', () => {
    expect(sniffImage(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('image/jpeg');
    expect(sniffImage(bytes(0x89, 'PNG', 0x0d, 0x0a, 0x1a, 0x0a))).toBe('image/png');
    expect(sniffImage(bytes('RIFF', 0, 0, 0, 0, 'WEBP'))).toBe('image/webp');
    expect(sniffImage(bytes(0, 0, 0, 0x18, 'ftyp', 'heic'))).toBe('image/heic');
    expect(sniffImage(bytes(0, 0, 0, 0x18, 'ftyp', 'mif1'))).toBe('image/heic');
  });

  it('rejects everything else', () => {
    expect(sniffImage(bytes('<svg xmlns'))).toBeNull();
    expect(sniffImage(bytes('%PDF-1.4'))).toBeNull();
    expect(sniffImage(bytes(0, 0, 0, 0x18, 'ftyp', 'mp42'))).toBeNull(); // a video
    expect(sniffImage(new Uint8Array(3))).toBeNull();
  });
});
