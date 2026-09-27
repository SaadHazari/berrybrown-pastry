import { describe, expect, it } from 'vitest';
import { nextBarState } from './topbar';

const shown = { condensed: false, hidden: false };

describe('top bar', () => {
  it('condenses after 80 px', () => {
    expect(nextBarState(shown, 81, 0, false).condensed).toBe(true);
    expect(nextBarState(shown, 80, 0, false).condensed).toBe(false);
  });

  it('hides while scrolling down past 400 px and comes back on any scroll up', () => {
    const down = nextBarState(shown, 900, 800, false);
    expect(down.hidden).toBe(true);
    expect(nextBarState(down, 880, 900, false).hidden).toBe(false);
  });

  it('never hides near the top or while locked', () => {
    expect(nextBarState(shown, 300, 200, false).hidden).toBe(false);
    expect(nextBarState({ condensed: true, hidden: true }, 900, 800, true).hidden).toBe(false);
  });

  it('ignores tiny moves and keeps the same object', () => {
    const s = { condensed: true, hidden: false };
    expect(nextBarState(s, 902, 900, false)).toBe(s);
  });
});
