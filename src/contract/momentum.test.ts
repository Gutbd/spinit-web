import { describe, expect, it } from "vitest";
import { toSpectatorMomentum } from "./momentum";

describe("toSpectatorMomentum", () => {
  const A = 0;
  const B = 1;

  it.each([
    [[], 0],
    [[A], 1],
    [[B], -1],
    [[A, A, A, A, A], 5],
    [[B, B, B, B, B], -5],
    [[A, A, B, B, B], -1],
    [[A, B, A, B, A], 1],
  ])("toSpectatorMomentum(%j) === %i", (scorers, expected) => {
    expect(toSpectatorMomentum(scorers)).toBe(expected);
  });
});
