import type { RawLiveMatchDoc, ScheduledState } from "./types";

/**
 * Pure `raw Firestore doc -> ScheduledState | null` mapper for a pre-match (SCHEDULED) document —
 * the web counterpart of Android's `buildScheduledLiveState` (spinit-track
 * MatchStateFirestoreSerializer.kt). Returns `null` for any document that is NOT
 * `state.status === "SCHEDULED"` (including LIVE/FINISHED/legacy), so callers fall through to the
 * normal live/finished mapper unchanged.
 *
 * Tolerant of missing optional metadata: `championshipName`/`phase`/`scheduledAt` become `null` when
 * absent rather than failing the whole document — the authoritative signal is `status`, and player
 * names use the same "Jogador A/B" fallback the live mapper uses. No value is ever fabricated.
 */
export function toScheduledState(
  doc: RawLiveMatchDoc,
  shareCode: string,
): ScheduledState | null {
  const state = doc["state"];
  if (!isRecord(state)) return null;
  if (state["status"] !== "SCHEDULED") return null;

  return {
    shareCode,
    playerAName: playerFallbackName(state["playerAName"], "A"),
    playerBName: playerFallbackName(state["playerBName"], "B"),
    matchTypeLabel: asNonEmptyString(state["matchTypeLabel"]),
    championshipName: asNonEmptyString(state["championshipName"]),
    phase: asNonEmptyString(state["phase"]),
    scheduledAt: asInt(state["scheduledAt"]),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  return null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function playerFallbackName(value: unknown, player: "A" | "B"): string {
  return typeof value === "string" && value.trim().length > 0 ? value : `Jogador ${player}`;
}
