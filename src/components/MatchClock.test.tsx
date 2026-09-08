import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchClock } from "./MatchClock";
import { displayElapsedMs, formatMatchClock, matchClockLabel } from "./matchClockFormat";
import type { MatchTimerView } from "../contract/types";

const T0 = 1_000_000_000;
const oneHour24m32s = (1 * 3600 + 24 * 60 + 32) * 1000; // 01:24:32

describe("MatchClock — format helpers (shared render contract)", () => {
  it("is compact under an hour and HH:MM:SS past it", () => {
    expect(formatMatchClock(0)).toBe("00:00");
    expect(formatMatchClock((5 * 60 + 7) * 1000)).toBe("05:07");
    expect(formatMatchClock(3_600_000)).toBe("01:00:00");
    expect(formatMatchClock(oneHour24m32s)).toBe("01:24:32");
    expect(formatMatchClock(-500)).toBe("00:00"); // skew never renders a broken clock
  });

  it("ticks a running timer from the anchor, freezes a paused one", () => {
    const running: MatchTimerView = { startedAtMs: T0, paused: false, elapsedMs: 0, running: true };
    expect(displayElapsedMs(running, T0 + oneHour24m32s)).toBe(oneHour24m32s);

    const paused: MatchTimerView = { startedAtMs: T0, paused: true, elapsedMs: 300_000, running: false };
    expect(displayElapsedMs(paused, T0 + oneHour24m32s)).toBe(300_000); // ignores wall clock
  });

  it("labels running vs paused", () => {
    expect(matchClockLabel(oneHour24m32s, false)).toBe("⏱ 01:24:32");
    expect(matchClockLabel(300_000, true)).toBe("⏱ 05:00 · PAUSADO");
  });
});

describe("MatchClock — component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0 + oneHour24m32s);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the running effective time ticked from the anchor", () => {
    render(<MatchClock timer={{ startedAtMs: T0, paused: false, elapsedMs: 0, running: true }} />);
    expect(screen.getByText("⏱ 01:24:32")).toBeInTheDocument();
  });

  it("renders the frozen time with a compact PAUSADO marker", () => {
    render(<MatchClock timer={{ startedAtMs: T0, paused: true, elapsedMs: (45 * 60 + 10) * 1000, running: false }} />);
    const el = screen.getByText("⏱ 45:10 · PAUSADO");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("scoreboard-timer-paused");
  });

  it("renders nothing when there is no timer (older docs)", () => {
    const { container } = render(<MatchClock timer={null} />);
    expect(container.querySelector(".scoreboard-timer")).toBeNull();
  });
});
