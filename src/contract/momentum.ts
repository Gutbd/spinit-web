/**
 * Compact spectator Momentum (FEATURE-007 D2) — identical semantics to Android's
 * `List<Int>.toSpectatorMomentum()` (SpectatorMomentum.kt) and FEATURE-005's
 * `A_won - B_won` rolling window: scorer 0 (A) = +1, scorer 1 (B) = -1, folded over
 * `recentScorers` (already capped at 5 by the host), range [-5, +5].
 *
 * Never the backend `insights.momentum` streak metric under this label (locked, D2).
 */
export function toSpectatorMomentum(recentScorers: number[]): number {
  return recentScorers.reduce((acc, scorer) => acc + (scorer === 0 ? 1 : -1), 0);
}
