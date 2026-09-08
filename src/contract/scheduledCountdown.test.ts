import { describe, expect, it } from "vitest";
import { formatScheduledCountdown } from "./scheduledCountdown";

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatScheduledCountdown", () => {
  it("shows days, hours, minutes and seconds for a future time", () => {
    const now = 0;
    const scheduledAt = 2 * DAY + 4 * HOUR + 18 * MIN + 32 * SEC;
    expect(formatScheduledCountdown(scheduledAt, now)).toBe("Começa em 2d 04h 18min 32s");
  });

  it("omits days when less than one day away", () => {
    const now = 0;
    const scheduledAt = 4 * HOUR + 18 * MIN + 32 * SEC;
    expect(formatScheduledCountdown(scheduledAt, now)).toBe("Começa em 04h 18min 32s");
  });

  it("shows a passed message when the scheduled time is reached", () => {
    expect(formatScheduledCountdown(1000, 1000)).toBe("Horário previsto atingido");
  });

  it("never shows a negative countdown once passed", () => {
    const result = formatScheduledCountdown(1000, 5000);
    expect(result).toBe("Horário previsto atingido");
    expect(result).not.toContain("-");
  });
});
