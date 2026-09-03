import type {
  CompletedSetView,
  ImportantMomentKind,
  RawLiveMatchDoc,
  SpectatorState,
  SpectatorMatchStatus,
} from "./types";

/**
 * Pure `raw Firestore doc -> SpectatorState | null` mapper — the web counterpart of Android's
 * `Map<String, Any?>.toSpectatorState()` (spinit-track LiveMatchSpectatorMapper.kt). `null` means
 * a malformed/partial snapshot (a required field missing or the wrong type); callers must show an
 * error state, never fabricate score data.
 *
 * NOTE (documented parity deviation, not a contract fork): Android treats `playerAName`/
 * `playerBName` as fallback-safe ("Jogador A"/"Jogador B" when absent/blank), not
 * fail-to-null — matching the real shipped Android mapper and the required
 * "player name fallback" test case. This mirrors that behavior. See the Part 4
 * implementation report for the discrepancy this resolves in the planning text.
 */
export function toSpectatorState(
  doc: RawLiveMatchDoc,
  shareCode: string,
): SpectatorState | null {
  const state = doc["state"];
  if (!isRecord(state)) return null;

  const status = toStatus(state["status"]);
  if (status === null) return null;

  const gamesA = asInt(state["gamesA"]);
  const gamesB = asInt(state["gamesB"]);
  const setsA = asInt(state["setsA"]);
  const setsB = asInt(state["setsB"]);
  const isTieBreak = asBoolean(state["isTieBreak"]);
  const isSuperTieBreak = asBoolean(state["isSuperTieBreak"]);
  const currentServer = asInt(state["currentServer"]);
  const pointsA = asNonEmptyString(state["pointDisplayA"]);
  const pointsB = asNonEmptyString(state["pointDisplayB"]);

  if (
    gamesA === null ||
    gamesB === null ||
    setsA === null ||
    setsB === null ||
    isTieBreak === null ||
    isSuperTieBreak === null ||
    currentServer === null ||
    pointsA === null ||
    pointsB === null
  ) {
    return null;
  }

  return {
    shareCode,
    status,
    playerAName: playerFallbackName(state["playerAName"], "A"),
    playerBName: playerFallbackName(state["playerBName"], "B"),
    pointsA,
    pointsB,
    gamesA,
    gamesB,
    setsA,
    setsB,
    isTieBreak,
    isSuperTieBreak,
    currentServer,
    matchWinner: asInt(state["matchWinner"]),
    statusLabel: asNonEmptyString(state["statusLabel"]),
    recentScorers: asRecentScorers(state["recentScorers"]),
    completedSets: asCompletedSets(state["completedSets"]),
    importantMoment: asImportantMoment(state["importantMoment"]),
    pressureMomentPlayer: asPlayerIndex(state["pressureMomentPlayer"]),
  };
}

function toStatus(value: unknown): SpectatorMatchStatus | null {
  if (value === "LIVE" || value === "FINISHED") return value;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  return null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

/** Returns `null` for both "missing" and "" — matches Android's `asNonBlankString` for
 * `statusLabel`, and its `String ?: return null` required-field check for point displays. */
function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function playerFallbackName(value: unknown, player: "A" | "B"): string {
  return typeof value === "string" && value.trim().length > 0 ? value : `Jogador ${player}`;
}

/** Absent -> []. Only 0/1 are valid scorer indexes; anything else is dropped rather than
 * fabricated or allowed to corrupt the Momentum fold (stricter than Android's plain `asInt`
 * pass-through, since the host never emits anything else in practice). */
function asRecentScorers(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is number => entry === 0 || entry === 1);
}

/** Absent/malformed -> []. A set entry missing valid gamesA/gamesB is dropped rather than
 * fabricated. Tiebreak points are kept only as a matched pair (both present), else both null —
 * never a partial "6 (10) × 6 (null)". Presentation only; no scoring is recomputed. */
function asCompletedSets(value: unknown): CompletedSetView[] {
  if (!Array.isArray(value)) return [];
  const out: CompletedSetView[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const gamesA = asInt(entry["gamesA"]);
    const gamesB = asInt(entry["gamesB"]);
    if (gamesA === null || gamesB === null) continue;
    const tieBreakA = asInt(entry["tieBreakA"]);
    const tieBreakB = asInt(entry["tieBreakB"]);
    const paired = tieBreakA !== null && tieBreakB !== null;
    out.push({
      gamesA,
      gamesB,
      tieBreakA: paired ? tieBreakA : null,
      tieBreakB: paired ? tieBreakB : null,
    });
  }
  return out;
}

const IMPORTANT_MOMENTS: readonly ImportantMomentKind[] = ["BREAK_POINT", "SET_POINT", "MATCH_POINT"];

/** Only the three authoritative contract names are accepted; anything else (including an older
 * doc's absent field) -> null, so the spectator simply shows no indicator. */
function asImportantMoment(value: unknown): ImportantMomentKind | null {
  return typeof value === "string" && (IMPORTANT_MOMENTS as readonly string[]).includes(value)
    ? (value as ImportantMomentKind)
    : null;
}

/** Only 0 (A) or 1 (B) are valid player indexes; anything else -> null. */
function asPlayerIndex(value: unknown): number | null {
  return value === 0 || value === 1 ? value : null;
}
