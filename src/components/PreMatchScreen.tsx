import { useEffect, useState } from "react";
import type { ScheduledState } from "../contract/types";
import {
  formatScheduledCountdown,
  formatScheduledDateTime,
} from "../contract/scheduledCountdown";

/**
 * Pre-match view for a `state.status === "SCHEDULED"` document. Reuses the live scoreboard's visual
 * language (same `.scoreboard*` cards, spacing, and per-player identity colors) rather than a new
 * design. The countdown is informational only — it never gates starting (that rule lives on the
 * Android Host). When the host flips the document to LIVE, the parent switches this out for the live
 * scoreboard automatically (same URL, same subscription).
 */
export function PreMatchScreen({ scheduled }: { scheduled: ScheduledState }) {
  return (
    <section className="scoreboard" aria-live="polite">
      <div className="scoreboard-brand">SpinIt Track · Ao Vivo</div>

      {scheduled.championshipName && (
        <div className="prematch-championship">{scheduled.championshipName}</div>
      )}
      {scheduled.phase && <div className="prematch-phase">{scheduled.phase}</div>}

      <div className="prematch-players">
        <span className="player-name identity-a">{scheduled.playerAName}</span>
        <span className="prematch-vs">×</span>
        <span className="player-name identity-b">{scheduled.playerBName}</span>
      </div>

      {scheduled.matchTypeLabel && (
        <div className="prematch-format">{scheduled.matchTypeLabel}</div>
      )}

      {scheduled.scheduledAt !== null && (
        <div className="prematch-datetime">{formatScheduledDateTime(scheduled.scheduledAt)}</div>
      )}

      <div className="scoreboard-status-label prematch-status">PARTIDA AGENDADA</div>

      {scheduled.scheduledAt !== null && <Countdown scheduledAt={scheduled.scheduledAt} />}
    </section>
  );
}

/** Ticks once a second; the label itself is a pure function of `now` (formatScheduledCountdown). */
function Countdown({ scheduledAt }: { scheduledAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="prematch-countdown" role="status">
      {formatScheduledCountdown(scheduledAt, now)}
    </div>
  );
}
