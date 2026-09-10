import { describe, expect, it } from "vitest";
import {
  MOMENTUM_CENTER_INDEX,
  momentumCircles,
  momentumContextCopy,
} from "./momentumVisual";

/**
 * Contract tests for the shared five-circle Momentum mapping. These MUST stay in lock-step with
 * spinit-track's `MomentumVisualTest.kt` — the two platforms may never diverge.
 *
 * Notation: `T` = active (yellow), `_` = inactive. Index 0 = A-max (left), 2 = center, 4 = B-max.
 */
const pattern = (value: number) => momentumCircles(value).map((a) => (a ? "T" : "_")).join("");

describe("momentumCircles — shared five-circle mapping", () => {
  it("neutral shows only the center", () => {
    expect(pattern(0)).toBe("__T__");
  });

  it("A weaker fills one circle toward A", () => {
    expect(pattern(1)).toBe("_TT__");
    expect(pattern(2)).toBe("_TT__");
  });

  it("A maximum fills both circles toward A", () => {
    expect(pattern(3)).toBe("TTT__");
    expect(pattern(4)).toBe("TTT__");
    expect(pattern(5)).toBe("TTT__");
  });

  it("B weaker fills one circle toward B", () => {
    expect(pattern(-1)).toBe("__TT_");
    expect(pattern(-2)).toBe("__TT_");
  });

  it("B maximum fills both circles toward B", () => {
    expect(pattern(-3)).toBe("__TTT");
    expect(pattern(-4)).toBe("__TTT");
    expect(pattern(-5)).toBe("__TTT");
  });

  it("equivalent A and B magnitudes are mirrored", () => {
    for (let m = 1; m <= 5; m++) {
      expect(momentumCircles(m)).toEqual([...momentumCircles(-m)].reverse());
    }
  });

  it("always exactly five circles, center always active", () => {
    for (let v = -5; v <= 5; v++) {
      const c = momentumCircles(v);
      expect(c).toHaveLength(5);
      expect(c[MOMENTUM_CENTER_INDEX]).toBe(true);
    }
  });

  it("A and B never fill simultaneously", () => {
    for (let v = -5; v <= 5; v++) {
      const c = momentumCircles(v);
      const aSide = c[0] || c[1];
      const bSide = c[3] || c[4];
      expect(aSide && bSide).toBe(false);
    }
  });

  it("stronger momentum never produces less fill", () => {
    let prevA = -1;
    for (let v = 0; v <= 5; v++) {
      const c = momentumCircles(v);
      const fillA = (c[0] ? 1 : 0) + (c[1] ? 1 : 0);
      expect(fillA).toBeGreaterThanOrEqual(prevA);
      prevA = fillA;
    }
    let prevB = -1;
    for (let v = 0; v >= -5; v--) {
      const c = momentumCircles(v);
      const fillB = (c[3] ? 1 : 0) + (c[4] ? 1 : 0);
      expect(fillB).toBeGreaterThanOrEqual(prevB);
      prevB = fillB;
    }
  });

  it.each([
    [0, "Momento equilibrado"],
    [1, "Momento favorável a Gustavo"],
    [2, "Momento favorável a Gustavo"],
    [3, "Gustavo domina o momento"],
    [5, "Gustavo domina o momento"],
    [-1, "Momento favorável a André"],
    [-2, "Momento favorável a André"],
    [-3, "André domina o momento"],
    [-5, "André domina o momento"],
  ])("context copy for value %i", (value, expected) => {
    expect(momentumContextCopy(value, "Gustavo", "André")).toBe(expected);
  });

  it("context copy resolves from the same state as the circles", () => {
    for (let v = -5; v <= 5; v++) {
      const c = momentumCircles(v);
      const expected = c[0]
        ? "A domina o momento"
        : c[1]
          ? "Momento favorável a A"
          : c[4]
            ? "B domina o momento"
            : c[3]
              ? "Momento favorável a B"
              : "Momento equilibrado";
      expect(momentumContextCopy(v, "A", "B")).toBe(expected);
    }
  });

  it("crossing from A to B passes through neutral before filling B", () => {
    let bSeen = false;
    for (let v = 5; v >= -5; v--) {
      const c = momentumCircles(v);
      const aSide = c[0] || c[1];
      const bSide = c[3] || c[4];
      if (bSide) bSeen = true;
      if (bSeen) expect(aSide).toBe(false);
    }
  });
});
