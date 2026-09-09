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
  /** Match mode/type name (e.g. "BEST_OF_3", "TIE_BREAK_ONLY"), or null on docs that don't publish
   * it. Used to tell a tie-break-only match (where the tie-break IS the format) from a set tie-break
   * inside a normal match. */
  matchType: string | null;
  /** Human-readable match format (e.g. "Melhor de 3", "Tie-break"), or null when absent. */
  matchTypeLabel: string | null;
  /** Optional championship/tournament name shown in the match-info header, or null. */
  championshipName: string | null;
  /** Optional phase/round shown in the match-info header, or null. */
  phase: string | null;
  /** Last up-to-5 scorers (0 = A, 1 = B), oldest -> newest. Empty when absent. */
  recentScorers: number[];
  /** Concluded sets only, oldest -> newest (FEATURE-007.1). The in-progress set is never here —
   * it lives in gamesA/gamesB. Empty when absent (older docs). */
  completedSets: CompletedSetView[];
  /** Authoritative pressure moment from the domain, or null when there is none / older docs. */
  importantMoment: ImportantMomentKind | null;
  /** Player (0 = A, 1 = B) who owns the pressure moment, or null when there is none. */
  pressureMomentPlayer: number | null;
  /** Host-authoritative match timer, or null on docs predating the feature (clock hidden then). */
  timer: MatchTimerView | null;
}

/**
 * Web-side mirror of Android's `MatchTimerState` (spinit-track MatchTimer.kt). The Android host is
 * the SOLE timer authority; the Web renders this verbatim and runs no inactivity/timer logic:
 *  - `running` → tick the clock from `startedAtMs` (`elapsed = now - startedAtMs`);
 *  - otherwise → show `elapsedMs` frozen (`paused` = inactivity auto-pause → "· PAUSADO";
 *    `!paused` = match finished → final duration).
 */
export interface MatchTimerView {
  startedAtMs: number;
  paused: boolean;
  elapsedMs: number;
  running: boolean;
}

/**
 * Pre-match view of a `live_matches/{shareCode}` document whose `state.status === "SCHEDULED"`
 * (mirror of Android's `buildScheduledLiveState`). Carries only scheduling metadata — a SCHEDULED
 * document has no score fields yet, so this is a distinct type from {@link SpectatorState}, not a
 * status variant of it. Optional metadata (championship/phase) is `null` when absent; the Web never
 * fabricates values.
 */
export interface ScheduledState {
  shareCode: string;
  playerAName: string;
  playerBName: string;
  /** Human-readable match format label (Android `matchTypeLabel`, e.g. "Melhor de 3"), or null. */
  matchTypeLabel: string | null;
  championshipName: string | null;
  phase: string | null;
  /** Intended kickoff time (epoch ms), or null if the host omitted it. */
  scheduledAt: number | null;
}

/** Raw shape of a `live_matches/{shareCode}` Firestore document's `.data()`. Untyped at the
 * boundary on purpose — the mapper is what narrows it. */
export type RawLiveMatchDoc = Record<string, unknown>;
