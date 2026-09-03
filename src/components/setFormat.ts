import type { CompletedSetView } from "../contract/types";

/**
 * Display formatting of an ALREADY-DECIDED set score (FEATURE-007.1), mirroring the Android
 * `CompletedSet.formatScore()` notation. This is presentation only — no tennis scoring logic
 * (nothing about who won a set is recomputed here); it just renders the numbers the host published.
 * Lives in its own module (not the component file) so the component file exports only components.
 */
export function formatSetScore(set: CompletedSetView): string {
  const hasTieBreak = set.tieBreakA !== null && set.tieBreakB !== null;
  if (!hasTieBreak) return `${set.gamesA} × ${set.gamesB}`;
  // Super-tiebreak-only set: no games were played, the tiebreak points ARE the set score.
  if (set.gamesA === 0 && set.gamesB === 0) return `${set.tieBreakA} × ${set.tieBreakB}`;
  // Regular tiebreak set: show each player's own tiebreak points next to their games.
  return `${set.gamesA} (${set.tieBreakA}) × ${set.gamesB} (${set.tieBreakB})`;
}
