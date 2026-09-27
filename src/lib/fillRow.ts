/** Repeats `items` in whole copies until there are at least `min`, so a drifting row never runs out and shows a gap. */
export function fillRow<T>(items: T[], min: number): T[] {
  if (items.length === 0) return [];
  const copies = Math.max(1, Math.ceil(min / items.length));
  return Array.from({ length: copies }, () => items).flat();
}
