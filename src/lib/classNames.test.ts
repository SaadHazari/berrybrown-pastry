import { describe, expect, it } from 'vitest';

/** Every component's source, as text. */
const sources = import.meta.glob('/src/**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

// Tailwind's named sizes resolve to our spacing tokens here (max-w-md is 1rem, max-w-lg is 29 px), so they must not be used.
const CLASH = /\b(?:max-w|min-w|w|max-h|min-h|h|basis|size)-(?:2xs|xs|sm|md|lg|xl|2xl|3xl)\b/g;

describe('class names', () => {
  it('never uses a named width or height that collides with the spacing tokens', () => {
    const hits = Object.entries(sources).flatMap(([file, text]) => (text.match(CLASH) ?? []).map((m) => `${file}: ${m}`));
    expect(Object.keys(sources).length).toBeGreaterThan(20);
    expect(hits).toEqual([]);
  });
});
