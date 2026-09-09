import { useEffect, useState } from "react";
import type { ScheduledState } from "../contract/types";
import {
  formatScheduledCountdown,
  formatScheduledDateTime,
} from "../contract/scheduledCountdown";

/** Countdown re-render cadence: minute-granularity label, so 30 s keeps the shown minute accurate
 * without re-rendering every second. */
const COUNTDOWN_TICK_MS = 30_000;

/**
 * Pre-match view for a `state.status === "SCHEDULED"` document — a responsive public sports display
 * (phone → tablet → desktop → TV), not a stretched mobile card. Reuses the SpinIt Live identity
 * (background, tokens, typography, Player A/B identity colors) but with an intentional large-screen
 * layout. Hierarchy: status → championship → phase → PLAYERS (main focus) → format → date/time →
 * countdown. Generic information uses neutral/theme colors only; Player A/B colors are reserved for
 * the player names. The countdown is informational — it never gates starting (Android host's rule).
 * When the host flips the document to LIVE, the parent swaps this out for the live scoreboard (same
 * URL, same subscription) — this component owns no transport.
 */
export function PreMatchScreen({ scheduled }: { scheduled: ScheduledState }) {
  return (
    <section className="prematch" aria-live="polite">
      <div className="prematch-content">
        <p className="prematch-brand">SpinIt Track · Ao Vivo</p>
        <p className="prematch-status">PARTIDA AGENDADA</p>

        {(scheduled.championshipName || scheduled.phase) && (
          <div className="prematch-context">
            {scheduled.championshipName && (
              <p className="prematch-championship">{scheduled.championshipName}</p>
            )}
            {scheduled.phase && <p className="prematch-phase">{scheduled.phase}</p>}
          </div>
        )}

        <div className="prematch-players">
          <span className="prematch-player identity-a">{scheduled.playerAName}</span>
          <span className="prematch-vs" aria-hidden="true">
            ×
          </span>
          <span className="prematch-player identity-b">{scheduled.playerBName}</span>
        </div>

        {(scheduled.matchTypeLabel || scheduled.scheduledAt !== null) && (
          <div className="prematch-meta">
            {scheduled.matchTypeLabel && (
              <span className="prematch-format">{scheduled.matchTypeLabel}</span>
            )}
            {scheduled.matchTypeLabel && scheduled.scheduledAt !== null && (
              <span className="prematch-meta-sep" aria-hidden="true">
                ·
              </span>
            )}
            {scheduled.scheduledAt !== null && (
              <span className="prematch-datetime">{formatScheduledDateTime(scheduled.scheduledAt)}</span>
            )}
          </div>
        )}

        {scheduled.scheduledAt !== null && <Countdown scheduledAt={scheduled.scheduledAt} />}
      </div>
    </section>
  );
}

/** Re-renders at minute granularity (no seconds shown); the label is a pure function of `now`. */
function Countdown({ scheduledAt }: { scheduledAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), COUNTDOWN_TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="prematch-countdown" role="status">
      {formatScheduledCountdown(scheduledAt, now)}
    </p>
  );
}
