/**
 * Pure countdown/formatting helpers for the pre-match (SCHEDULED) view. Informational only — the
 * Web never decides whether the Host may start the match (that rule lives on the Android Host).
 */

const MESSAGE_PASSED = "Horário previsto atingido";

/**
 * Live countdown label from `now` to `scheduledAt`, updated every second by the caller:
 *  - future: "Começa em 2d 04h 18min 32s" (days omitted entirely when less than a day away);
 *  - reached or passed (`scheduledAt - now <= 0`): "Horário previsto atingido" — never a negative
 *    value.
 */
export function formatScheduledCountdown(scheduledAt: number, now: number): string {
  const diffMs = scheduledAt - now;
  if (diffMs <= 0) return MESSAGE_PASSED;

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${pad2(hours)}h`, `${pad2(minutes)}min`, `${pad2(seconds)}s`);
  return `Começa em ${parts.join(" ")}`;
}

/** Local (browser-timezone) date+time label for the scheduled kickoff, e.g. "12/09/2026 14:00". */
export function formatScheduledDateTime(scheduledAt: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(scheduledAt));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
