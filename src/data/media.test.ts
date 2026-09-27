import { describe, expect, it } from 'vitest';
import slots from '../../scripts/photo-slots.json';
import { ALL_MEDIA, aiPhoto } from './media';

describe('media', () => {
  it('has 31 distinct AI photo slots, each with alt text and a label', () => {
    expect(ALL_MEDIA).toHaveLength(31);
    expect(new Set(ALL_MEDIA.map((m) => m.slot)).size).toBe(31);
    for (const m of ALL_MEDIA) {
      expect(m.ai).toBe(true);
      expect(m.alt.length).toBeGreaterThan(5);
      expect(m.label.length).toBeGreaterThan(0);
    }
  });

  it('matches the photo pipeline list slot for slot', () => {
    const ratios = new Map(slots.map((s) => [s.slot, s.ratio]));
    expect(slots).toHaveLength(ALL_MEDIA.length);
    for (const m of ALL_MEDIA) expect(ratios.get(m.slot ?? '')).toBe(m.ratio);
  });

  it('builds a two-width srcset under /images/ai, and a placeholder until the files exist', () => {
    const m = aiPhoto('test-slot', '4:5', 'A test photo', 'Test');
    expect(m.src).toBe('/images/ai/test-slot-1200.webp');
    expect(m.srcSet).toBe('/images/ai/test-slot-640.webp 640w, /images/ai/test-slot-1200.webp 1200w');
    expect([m.width, m.height]).toEqual([1200, 1500]);
    expect(m.placeholder).toBe(true);
  });
});
