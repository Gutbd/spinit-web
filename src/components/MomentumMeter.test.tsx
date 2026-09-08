import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MomentumMeter } from "./MomentumMeter";

const A = 0;
const B = 1;

/** Reads the leader identity ("a" | "b" | null) and magnitude the meter chose to render. */
function renderMeter(recentScorers: number[]) {
  const { container } = render(
    <MomentumMeter recentScorers={recentScorers} playerAName="Ana" playerBName="Bruna" />,
  );
  const fill = container.querySelector<HTMLElement>(".momentum-fill");
  return {
    leader: fill?.dataset.leader ?? null,
    // The class that actually carries the player's identity COLOR in CSS (momentum-fill-a =>
    // --accent-a teal, momentum-fill-b => --accent-b blue). null when no fill renders.
    colorClass:
      fill?.classList.contains("momentum-fill-a")
        ? "momentum-fill-a"
        : fill?.classList.contains("momentum-fill-b")
          ? "momentum-fill-b"
          : null,
    ariaLabel: container.querySelector(".momentum")?.getAttribute("aria-label") ?? "",
  };
}

describe("MomentumMeter — identity follows the player, not a fixed side", () => {
  it("shows the explicit title", () => {
    render(<MomentumMeter recentScorers={[]} playerAName="Ana" playerBName="Bruna" />);
    expect(screen.getByText("Momentum — últimos 5 pontos")).toBeInTheDocument();
  });

  it("colors each player's label with their own identity accent", () => {
    const { container } = render(
      <MomentumMeter recentScorers={[]} playerAName="Ana" playerBName="Bruna" />,
    );
    expect(container.querySelector(".momentum-label-a")?.textContent).toBe("Ana");
    expect(container.querySelector(".momentum-label-b")?.textContent).toBe("Bruna");
  });

  it.each([
    { scorers: [A, A, A, A, A], leader: "a", color: "momentum-fill-a", label: "Ana +5" },
    { scorers: [B, B, B, B, B], leader: "b", color: "momentum-fill-b", label: "Bruna +5" },
    // The exact case the user reported: A is GAINING momentum -> identity must be A, never B.
    { scorers: [A, A, A, B, B], leader: "a", color: "momentum-fill-a", label: "Ana +1" },
    { scorers: [B, B, B, A, A], leader: "b", color: "momentum-fill-b", label: "Bruna +1" },
  ])(
    "recentScorers=$scorers -> leader $leader ($label)",
    ({ scorers, leader, color, label }) => {
      const meter = renderMeter(scorers);
      expect(meter.leader).toBe(leader);
      // The fill must carry the LEADING player's own color class, not just render on their side.
      expect(meter.colorClass).toBe(color);
      expect(meter.ariaLabel).toContain(label);
    },
  );

  it("renders no fill and reads as balanced when momentum is 0", () => {
    const { container } = render(
      <MomentumMeter recentScorers={[A, B, A, B]} playerAName="Ana" playerBName="Bruna" />,
    );
    expect(container.querySelector(".momentum-fill")).toBeNull();
    expect(container.querySelector(".momentum")?.getAttribute("aria-label")).toContain("equilibrado");
  });
});

/**
 * Direct regression guard for the P1 report ("Player B has no visual color"). The three momentum
 * states must resolve to THREE visually distinct outcomes: A's own color class, no fill (neutral),
 * and B's own color class. Asserting the color-bearing class (not just `data-leader`) is what
 * prevents a silent regression where B's fill would inherit A's color and look like "no momentum".
 */
describe("MomentumMeter — both players get a distinct color (P1 visual guard)", () => {
  it("momentum favoring A -> A's color class (teal, --accent-a)", () => {
    expect(renderMeter([A, A, A]).colorClass).toBe("momentum-fill-a");
  });

  it("neutral -> no fill, no color", () => {
    expect(renderMeter([A, B]).colorClass).toBeNull();
  });

  it("momentum favoring B -> B's OWN color class (blue, --accent-b), distinct from A", () => {
    const b = renderMeter([B, B, B]).colorClass;
    expect(b).toBe("momentum-fill-b");
    expect(b).not.toBe("momentum-fill-a");
  });
});

/**
 * Regression guard for the reported inversion. The original bug anchored Player A's fill so it grew
 * toward Player B's label and vice-versa. The side now lives in the component's inline style (not
 * two mirrored CSS rules), so JSDOM can assert it directly: labels render A-left / B-right, so A's
 * fill must anchor its right edge at center (grows LEFT toward A) and B's must anchor its left edge
 * (grows RIGHT toward B).
 */
describe("MomentumMeter — fill side follows the leading player (A/B inversion guard)", () => {
  it("Player A leading: fill anchored right, so it grows LEFT toward Ana's label", () => {
    const { container } = render(
      <MomentumMeter recentScorers={[A, A, A]} playerAName="Ana" playerBName="Bruna" />,
    );
    const fill = container.querySelector<HTMLElement>(".momentum-fill")!;
    expect(fill.dataset.leader).toBe("a");
    expect(fill.style.right).toBe("50%");
    expect(fill.style.left).toBe("");
  });

  it("Player B leading: fill anchored left, so it grows RIGHT toward Bruna's label", () => {
    const { container } = render(
      <MomentumMeter recentScorers={[B, B, B]} playerAName="Ana" playerBName="Bruna" />,
    );
    const fill = container.querySelector<HTMLElement>(".momentum-fill")!;
    expect(fill.dataset.leader).toBe("b");
    expect(fill.style.left).toBe("50%");
    expect(fill.style.right).toBe("");
  });
});
