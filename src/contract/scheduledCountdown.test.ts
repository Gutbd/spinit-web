import { describe, expect, it } from "vitest";
import { formatScheduledCountdown, formatScheduledDateTime } from "./scheduledCountdown";

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatScheduledCountdown", () => {
  it("shows days, hours and minutes (no seconds) for a multi-day future", () => {
    const now = 0;
    const scheduledAt = 2 * DAY + 4 * HOUR + 18 * MIN + 32 * SEC;
    expect(formatScheduledCountdown(scheduledAt, now)).toBe("Começa em 2d 4h 18min");
  });

  it("omits days when less than one day away", () => {
    const now = 0;
    const scheduledAt = 4 * HOUR + 18 * MIN + 32 * SEC;
    expect(formatScheduledCountdown(scheduledAt, now)).toBe("Começa em 4h 18min");
  });

  it("shows only minutes when less than one hour away", () => {
    const now = 0;
    const scheduledAt = 18 * MIN + 59 * SEC;
    expect(formatScheduledCountdown(scheduledAt, now)).toBe("Começa em 18min");
  });

  it("never renders seconds", () => {
    const result = formatScheduledCountdown(5 * MIN, 0);
    expect(result).not.toMatch(/\ds\b/);
    expect(result).toBe("Começa em 5min");
  });

  it("shows a passed message when the scheduled time is reached", () => {
    expect(formatScheduledCountdown(1000, 1000)).toBe("Horário previsto atingido");
  });

  it("never shows a negative countdown once passed", () => {
    const result = formatScheduledCountdown(1000, 5 * MIN);
    expect(result).toBe("Horário previsto atingido");
    expect(result).not.toContain("-");
  });
});

describe("formatScheduledDateTime", () => {
  it("formats as 'DD MON · HH:MM' with an uppercase short month and no year", () => {
    // Timezone-agnostic assertion: check the shape, not the exact locale-shifted value.
    expect(formatScheduledDateTime(Date.UTC(2026, 8, 12, 14, 0))).toMatch(
      /^\d{2} [A-ZÇ]{3} · \d{2}:\d{2}$/,
    );
  });
});
