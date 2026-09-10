/**
 * Deterministic, symmetric mapping from the domain Momentum value (FEATURE-005 rolling last-5,
 * range [-5, +5]; positive favors Player A, negative Player B) onto a FIXED five-circle visual
 * scale shared, contract-for-contract, with spinit-track (`MomentumVisual.kt`).
 *
 * This is PRESENTATION only — it never touches `toSpectatorMomentum` (momentum.ts); it merely
 * reads that single value.
 *
 * Circle layout (left → right), always exactly five, center always active:
 *
 *     A-max   A-weak   CENTER   B-weak   B-max
 *      [0]      [1]      [2]      [3]      [4]
 *
 * There is only ONE momentum value, so A and B never fill at the same time: momentum grows
 * OUTWARD from the center toward the leading player, and a value crossing 0 always empties one
 * side before filling the other (A-max → A-weak → neutral → B-weak → B-max, and back).
 *
 * Threshold mapping of |value| → number of circles filled on the leading side:
 *
 *     0      -> 0 (neutral)   ○ ○ ● ○ ○
 *     1..2   -> 1 (weaker)    ○ ● ● ○ ○  /  ○ ○ ● ● ○
 *     3..5   -> 2 (maximum)   ● ● ● ○ ○  /  ○ ○ ● ● ●
 *
 * Monotonic — stronger momentum toward a player never yields fewer filled circles on that side.
 * Symmetric — equal |value| on either side produces mirrored patterns.
 */
export const MOMENTUM_CIRCLE_COUNT = 5;
export const MOMENTUM_CENTER_INDEX = 2;

/** Returns the active/inactive state of the five circles, index 0 = A-max (left) … 4 = B-max (right). */
export function momentumCircles(value: number): boolean[] {
  const magnitude = Math.abs(value);
  const level = magnitude >= 3 ? 2 : magnitude >= 1 ? 1 : 0;
  const active = [false, false, true, false, false];
  if (value > 0) {
    if (level >= 1) active[1] = true;
    if (level >= 2) active[0] = true;
  } else if (value < 0) {
    if (level >= 1) active[3] = true;
    if (level >= 2) active[4] = true;
  }
  return active;
}
