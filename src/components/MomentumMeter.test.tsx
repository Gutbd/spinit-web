import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MomentumMeter } from "./MomentumMeter";

const A = 0;
const B = 1;

/** Reads the rendered five-circle pattern as "T"/"_" plus the aria-label. */
function renderMeter(recentScorers: number[]) {
  const { container } = render(
    <MomentumMeter recentScorers={recentScorers} playerAName="Ana" playerBName="Bruna" />,
  );
  const dots = Array.from(container.querySelectorAll<HTMLElement>(".momentum-dot"));
  const pattern = dots.map((d) => (d.dataset.active === "true" ? "T" : "_")).join("");
  return {
    pattern,
    dotCount: dots.length,
    ariaLabel: container.querySelector(".momentum")?.getAttribute("aria-label") ?? "",
  };
}

describe("MomentumMeter — unified five-circle visual", () => {
  it("shows the explicit title", () => {
    render(<MomentumMeter recentScorers={[]} playerAName="Ana" playerBName="Bruna" />);
    expect(screen.getByText("Momentum — últimos 5 pontos")).toBeInTheDocument();
  });

  it("renders exactly five circles from the start, neutral center-only before any point", () => {
    const meter = renderMeter([]);
    expect(meter.dotCount).toBe(5);
    expect(meter.pattern).toBe("__T__");
  });

  it.each([
    { scorers: [], pattern: "__T__" }, // neutral
    { scorers: [A], pattern: "_TT__" }, // A weaker
    { scorers: [A, A, A], pattern: "TTT__" }, // A maximum
    { scorers: [B], pattern: "__TT_" }, // B weaker
    { scorers: [B, B, B], pattern: "__TTT" }, // B maximum
    { scorers: [A, A, A, B, B], pattern: "_TT__" }, // net +1 -> A weaker
  ])("recentScorers=$scorers -> $pattern", ({ scorers, pattern }) => {
    expect(renderMeter(scorers).pattern).toBe(pattern);
  });

  it("both player labels use the SAME neutral styling (no per-player color class)", () => {
    const { container } = render(
      <MomentumMeter recentScorers={[A, A, A]} playerAName="Ana" playerBName="Bruna" />,
    );
    const labels = Array.from(container.querySelectorAll(".momentum-label"));
    expect(labels.map((l) => l.textContent)).toEqual(["Ana", "Bruna"]);
    // Neither label carries a player-identity color class.
    expect(container.querySelector(".momentum-label-a")).toBeNull();
    expect(container.querySelector(".momentum-label-b")).toBeNull();
  });

  it("equivalent A/B magnitudes render mirrored patterns", () => {
    expect(renderMeter([A, A, A]).pattern).toBe(
      [...renderMeter([B, B, B]).pattern].reverse().join(""),
    );
  });

  it("keeps a descriptive aria-label", () => {
    expect(renderMeter([A, A, A, A, A]).ariaLabel).toContain("Ana +5");
    expect(renderMeter([B, B, B, B, B]).ariaLabel).toContain("Bruna +5");
    expect(renderMeter([A, B]).ariaLabel).toContain("equilibrado");
  });
});
