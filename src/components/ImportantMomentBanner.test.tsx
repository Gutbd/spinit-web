import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportantMomentBanner } from "./ImportantMomentBanner";

function renderBanner(moment: Parameters<typeof ImportantMomentBanner>[0]["moment"], pressurePlayer: number | null) {
  return render(
    <ImportantMomentBanner
      moment={moment}
      pressurePlayer={pressurePlayer}
      playerAName="Gustavo"
      playerBName="João"
    />,
  );
}

describe("ImportantMomentBanner", () => {
  it("renders nothing when there is no moment", () => {
    const { container } = renderBanner(null, null);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when the moment exists but the pressure player is unknown", () => {
    const { container } = renderBanner("BREAK_POINT", null);
    expect(container.firstChild).toBeNull();
  });

  it("shows BREAK POINT for Player A with A's identity color", () => {
    const { container } = renderBanner("BREAK_POINT", 0);
    expect(screen.getByText("Break Point")).toBeInTheDocument();
    expect(screen.getByText("Gustavo")).toBeInTheDocument();
    expect(container.querySelector(".important-moment-a")).not.toBeNull();
    expect(container.querySelector(".important-moment-b")).toBeNull();
  });

  it("shows SET POINT for Player B with B's identity color", () => {
    const { container } = renderBanner("SET_POINT", 1);
    expect(screen.getByText("Set Point")).toBeInTheDocument();
    expect(screen.getByText("João")).toBeInTheDocument();
    expect(container.querySelector(".important-moment-b")).not.toBeNull();
    expect(container.querySelector(".important-moment-a")).toBeNull();
  });

  it("shows MATCH POINT for the player named by pressureMomentPlayer", () => {
    renderBanner("MATCH_POINT", 0);
    expect(screen.getByText("Match Point")).toBeInTheDocument();
    expect(screen.getByText("Gustavo")).toBeInTheDocument();
  });
});
