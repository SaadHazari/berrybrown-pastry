/** When each letter of a typed text appears: one every `charMs` from `startMs`, with a pause between lines. */
export type TypeTiming = { startMs: number; charMs: number; lineGapMs: number };

/** How many letters of each line show `ms` after the start of the clock. */
export function typedCounts(lines: readonly string[], ms: number, t: TypeTiming): number[] {
  let start = t.startMs;
  return lines.map((line) => {
    const n = ms < start ? 0 : Math.min(line.length, Math.floor((ms - start) / t.charMs) + 1);
    start += line.length * t.charMs + t.lineGapMs;
    return n;
  });
}

/** The moment the last letter appears. */
export function typingEnd(lines: readonly string[], t: TypeTiming): number {
  const letters = lines.reduce((sum, line) => sum + line.length, 0);
  return t.startMs + (letters - 1) * t.charMs + (lines.length - 1) * t.lineGapMs;
}
