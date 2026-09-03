import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SetHistory } from "./SetHistory";
import { formatSetScore } from "./setFormat";
import type { CompletedSetView } from "../contract/types";

const plain = (gamesA: number, gamesB: number): CompletedSetView => ({
  gamesA,
  gamesB,
  tieBreakA: null,
  tieBreakB: null,
});

describe("SetHistory", () => {
  it("renders nothing when there are no concluded sets (older doc / new match)", () => {
    const { container } = render(<SetHistory completedSets={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows a finished SINGLE_SET 6×3 clearly", () => {
    render(<SetHistory completedSets={[plain(6, 3)]} />);
    expect(screen.getByText("6 × 3")).toBeInTheDocument();
    expect(screen.getByText("1º set")).toBeInTheDocument();
  });

  it("lists each set of a BEST_OF_3 in order", () => {
    render(<SetHistory completedSets={[plain(6, 4), plain(3, 6), plain(6, 2)]} />);
    const scores = screen.getAllByText(/×/).map((el) => el.textContent);
    expect(scores).toEqual(["6 × 4", "3 × 6", "6 × 2"]);
    expect(screen.getByText("3º set")).toBeInTheDocument();
  });
});

describe("formatSetScore", () => {
  it("formats a plain set", () => {
    expect(formatSetScore(plain(6, 3))).toBe("6 × 3");
  });

  it("formats a regular tiebreak set with both players' tiebreak points", () => {
    expect(formatSetScore({ gamesA: 7, gamesB: 6, tieBreakA: 10, tieBreakB: 8 })).toBe("7 (10) × 6 (8)");
  });

  it("formats a super-tiebreak-only set as the bare tiebreak points", () => {
    expect(formatSetScore({ gamesA: 0, gamesB: 0, tieBreakA: 10, tieBreakB: 7 })).toBe("10 × 7");
  });
});
