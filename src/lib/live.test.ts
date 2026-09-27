import { describe, expect, it } from 'vitest';
import { cakeFromRow, reviewFromRow } from './live';

describe('live rows', () => {
  it('maps a cake with a photo to a real image slot', () => {
    const c = cakeFromRow({ n: 42, made_for: "for Ayesha's dad, 60th", flavour: 'Classic chocolate', size: '8"', photo_path: '042.jpg' });
    expect(c.n).toBe(42);
    expect(c.image.placeholder).toBe(false);
    expect(c.image.src).toBe('https://ylrqmwfnelwqbychdpfb.supabase.co/storage/v1/object/public/cakes/042.jpg');
    expect(c.image.label).toBe('#042');
    expect(c.sample).toBe(false);
  });

  it('maps a cake without a photo to the Rose placeholder with its number', () => {
    const c = cakeFromRow({ n: 7, made_for: 'for a baby shower', flavour: 'Berry cream', size: '6"', photo_path: null });
    expect(c.image.placeholder).toBe(true);
    expect(c.image.label).toBe('#007');
  });

  it('maps a review', () => {
    expect(reviewFromRow({ id: 'x', name: 'Reem A.', area: 'Emirates Hills', text: 'Lovely.', cake: 'Berry Chocolate Drip', stars: 5 })).toEqual({
      name: 'Reem A.',
      area: 'Emirates Hills',
      text: 'Lovely.',
      cake: 'Berry Chocolate Drip',
      sample: false,
    });
  });
});
