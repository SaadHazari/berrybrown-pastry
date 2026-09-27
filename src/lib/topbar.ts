export type BarState = { condensed: boolean; hidden: boolean };

/** Where the top bar should be after a scroll from `lastY` to `y`. A locked bar (menu or overlay open) never hides. */
export function nextBarState(prev: BarState, y: number, lastY: number, locked: boolean): BarState {
  const condensed = y > 80;
  let hidden = prev.hidden;
  if (locked || y < 400) hidden = false;
  else if (y > lastY + 4) hidden = true;
  else if (y < lastY - 4) hidden = false;
  return prev.condensed === condensed && prev.hidden === hidden ? prev : { condensed, hidden };
}
