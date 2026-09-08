import { useEffect, useState } from "react";
import type { MatchTimerView } from "../contract/types";
import { displayElapsedMs, matchClockLabel, timerHasStarted } from "./matchClockFormat";

/**
 * Host-authoritative match clock for the Live spectator — the web counterpart of Android's
 * `MatchTimerState` + `rememberMatchClockLabel`. The host is the only authority: this only renders
 * a published {@link MatchTimerView}, ticking locally from the anchor while running and freezing
 * (with a compact "· PAUSADO") during an inactivity auto-pause, so the frozen clock reads as
 * intentionally paused, never broken. No inactivity/timer logic lives here.
 *
 * While running it re-reads the wall clock once per second (the doc is NOT rewritten every second);
 * while paused/finished it shows the frozen value with no ticking.
 */
export function MatchClock({ timer }: { timer: MatchTimerView | null }) {
  const running = timer?.running ?? false;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!timer || !timerHasStarted(timer)) return null;

  // Derived during render (no setState-in-effect): running ticks from `now`, otherwise the frozen
  // value (displayElapsedMs ignores `now` when not running).
  const elapsed = displayElapsedMs(timer, now);

  return (
    <div
      className={`scoreboard-timer${timer.paused ? " scoreboard-timer-paused" : ""}`}
      aria-live="off"
    >
      {matchClockLabel(elapsed, timer.paused)}
    </div>
  );
}
