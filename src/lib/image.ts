/**
 * Sniffs the real type of an uploaded image from its first bytes.
 * Pure — shared by the Worker (`/api/inspiration`) and the tests.
 */
export type ImageType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic';

export const IMAGE_EXT: Record<ImageType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

const HEIF_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1'];

export function sniffImage(bytes: Uint8Array): ImageType | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png';
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && HEIF_BRANDS.includes(ascii(8, 12))) return 'image/heic';
  return null;
}

/** Client-side pre-check: browsers report HEIC as image/heic, image/heif or an empty string. */
export const ACCEPTED_INPUT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';
