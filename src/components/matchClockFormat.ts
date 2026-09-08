import type { MatchTimerView } from "../contract/types";

/**
 * Pure host-authoritative match-clock helpers — the web counterpart of Android's
 * `MatchTimerState` display contract (`displayElapsedMs` + `formatMatchClock`/`matchClockLabel`).
 * Kept separate from the component (like `setFormat.ts`) so they stay trivially unit-testable and
 * the component file exports only a component. No inactivity/timer logic — the host is the sole
 * authority; these only format a value it published.
 */

/** "01:24:32" once past an hour, otherwise the compact "24:32". Negative/skew never shows broken. */
export function formatMatchClock(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

/** Elapsed to display at `now`: ticks from the anchor while running, else the frozen value. */
export function displayElapsedMs(timer: MatchTimerView, now: number): number {
  return Math.max(0, timer.running ? now - timer.startedAtMs : timer.elapsedMs);
}

/** `⏱ 01:24:32` while running, `⏱ 01:24:32 · PAUSADO` while inactivity-paused. */
export function matchClockLabel(elapsedMs: number, paused: boolean): string {
  const base = `⏱ ${formatMatchClock(elapsedMs)}`;
  return paused ? `${base} · PAUSADO` : base;
}

/** Whether a match timer has started at all — decides if any clock is shown. */
export function timerHasStarted(timer: MatchTimerView): boolean {
  return timer.running || timer.paused || timer.startedAtMs > 0 || timer.elapsedMs > 0;
}
