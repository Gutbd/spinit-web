/**
 * Pure countdown/formatting helpers for the pre-match (SCHEDULED) view. Informational only — the
 * Web never decides whether the Host may start the match (that rule lives on the Android Host).
 */

const MESSAGE_PASSED = "Horário previsto atingido";

/**
 * Minute-granularity countdown label from `now` to `scheduledAt` (no seconds — the caller updates
 * at minute level, not every second):
 *  - future: "Começa em 2d 4h 18min" / "Começa em 4h 18min" / "Começa em 18min" (a leading unit is
 *    shown only once a smaller unit becomes relevant: days appear only when ≥ 1 day away, hours only
 *    when ≥ 1 hour away);
 *  - reached or passed (`scheduledAt - now <= 0`): "Horário previsto atingido" — never a negative
 *    value.
 */
export function formatScheduledCountdown(scheduledAt: number, now: number): string {
  const diffMs = scheduledAt - now;
  if (diffMs <= 0) return MESSAGE_PASSED;

  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (days > 0 || hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}min`);
  return `Começa em ${parts.join(" ")}`;
}

/**
 * Local (browser-timezone) date+time label for the scheduled kickoff in a public-display format,
 * e.g. "12 SET · 14:00" — short uppercase month, no year (year is rarely useful on a pre-match
 * board and keeps the line compact on TV).
 */
export function formatScheduledDateTime(scheduledAt: number): string {
  const date = new Date(scheduledAt);
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
  const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
  return `${day} ${month} · ${time}`;
}
