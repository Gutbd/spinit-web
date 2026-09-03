/**
 * Web-side mirror of the Android `SpectatorState` / `SpectatorMatchStatus`
 * (spinit-track: app/src/main/kotlin/com/spinittrack/app/data/firebase/LiveMatchSpectatorMapper.kt).
 * Semantics must stay identical — see docs/live-match-contract-fixtures/README.md in spinit-track.
 */

export type SpectatorMatchStatus = "LIVE" | "FINISHED";

/** Stable contract names for the authoritative pressure moment computed by the Android domain
 * (`MatchState.importantMoment`). The Web only maps and renders these — it never recomputes them
 * from the score (FEATURE-007.1). */
export type ImportantMomentKind = "BREAK_POINT" | "SET_POINT" | "MATCH_POINT";

/** One concluded set (FEATURE-007.1), mirroring the Android `CompletedSet.toFirestoreSetMap()`
 * shape. `gamesA`/`gamesB` are raw games; `tieBreakA`/`tieBreakB` are both present (never one
 * without the other) only when the set was decided by a tiebreak, else both null. */
export interface CompletedSetView {
  gamesA: number;
  gamesB: number;
  tieBreakA: number | null;
  tieBreakB: number | null;
}

export interface SpectatorState {
  shareCode: string;
  status: SpectatorMatchStatus;
  playerAName: string;
  playerBName: string;
  /** Pre-formatted point label ("0"/"15"/"30"/"40"/"AD") — from `state.pointDisplayA/B`, never
   * the raw `pointsA`/`pointsB` counts. */
  pointsA: string;
  pointsB: string;
  gamesA: number;
  gamesB: number;
  setsA: number;
  setsB: number;
  isTieBreak: boolean;
  isSuperTieBreak: boolean;
  currentServer: number;
  matchWinner: number | null;
  statusLabel: string | null;
  /** Last up-to-5 scorers (0 = A, 1 = B), oldest -> newest. Empty when absent. */
  recentScorers: number[];
  /** Concluded sets only, oldest -> newest (FEATURE-007.1). The in-progress set is never here —
   * it lives in gamesA/gamesB. Empty when absent (older docs). */
  completedSets: CompletedSetView[];
  /** Authoritative pressure moment from the domain, or null when there is none / older docs. */
  importantMoment: ImportantMomentKind | null;
  /** Player (0 = A, 1 = B) who owns the pressure moment, or null when there is none. */
  pressureMomentPlayer: number | null;
}

/** Raw shape of a `live_matches/{shareCode}` Firestore document's `.data()`. Untyped at the
 * boundary on purpose — the mapper is what narrows it. */
export type RawLiveMatchDoc = Record<string, unknown>;
