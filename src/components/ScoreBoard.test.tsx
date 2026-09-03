import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBoard } from "./ScoreBoard";
import { toSpectatorState } from "../contract/mapper";
import type { RawLiveMatchDoc } from "../contract/types";
import liveFixture from "../testFixtures/live.json";
import finishedFixture from "../testFixtures/finished.json";

describe("ScoreBoard — smoke", () => {
  it("renders names, points, and games for a LIVE match", () => {
    const spectator = toSpectatorState(liveFixture as RawLiveMatchDoc, "AB12CD34")!;
    render(<ScoreBoard spectator={spectator} />);

    // "Ana"/"Bruna" appear twice by design (score row + momentum labels) — assert presence, not uniqueness.
    expect(screen.getAllByText("Ana").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bruna").length).toBeGreaterThan(0);
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("renders the winner banner for a FINISHED match", () => {
    const spectator = toSpectatorState(finishedFixture as RawLiveMatchDoc, "AB12CD34")!;
    render(<ScoreBoard spectator={spectator} />);

    expect(screen.getByText(/venceu a partida/)).toBeInTheDocument();
  });
});

describe("ScoreBoard — FEATURE-007.1 clarity", () => {
  it("labels the three numeric columns Pontos | Games | Sets", () => {
    const spectator = toSpectatorState(liveFixture as RawLiveMatchDoc, "AB12CD34")!;
    render(<ScoreBoard spectator={spectator} />);

    expect(screen.getByText("Pontos")).toBeInTheDocument();
    expect(screen.getByText("Games")).toBeInTheDocument();
    expect(screen.getByText("Sets")).toBeInTheDocument();
  });

  it("gives each player a color-identity class shared with their Momentum label", () => {
    const spectator = toSpectatorState(liveFixture as RawLiveMatchDoc, "AB12CD34")!;
    const { container } = render(<ScoreBoard spectator={spectator} />);

    expect(container.querySelector(".player-name.identity-a")?.textContent).toContain("Ana");
    expect(container.querySelector(".player-name.identity-b")?.textContent).toContain("Bruna");
    // Same accent identity is reused on the Momentum lane labels.
    expect(container.querySelector(".momentum-label-a")?.textContent).toBe("Ana");
    expect(container.querySelector(".momentum-label-b")?.textContent).toBe("Bruna");
  });

  it("marks only the current server's row with a serving dot", () => {
    // live fixture: currentServer === 1 (Bruna / player B).
    const spectator = toSpectatorState(liveFixture as RawLiveMatchDoc, "AB12CD34")!;
    const { container } = render(<ScoreBoard spectator={spectator} />);

    expect(container.querySelector(".player-row-b .serving-dot")).not.toBeNull();
    expect(container.querySelector(".player-row-a .serving-dot")).toBeNull();
  });

  it("hides the serving dot entirely once the match is finished", () => {
    const spectator = toSpectatorState(finishedFixture as RawLiveMatchDoc, "AB12CD34")!;
    const { container } = render(<ScoreBoard spectator={spectator} />);

    expect(container.querySelector(".serving-dot")).toBeNull();
  });

  it("separates a concluded set (history) from the in-progress set (Games column)", () => {
    // Set 1 finished 6×3; set 2 in progress at 4×3. History must show only 6×3; the scoreboard's
    // Games column must show the current 4 and 3.
    const doc: RawLiveMatchDoc = {
      state: {
        status: "LIVE",
        setsA: 1,
        setsB: 0,
        gamesA: 4,
        gamesB: 3,
        isTieBreak: false,
        isSuperTieBreak: false,
        isMatchOver: false,
        currentServer: 0,
        playerAName: "Gustavo",
        playerBName: "João",
        pointDisplayA: "15",
        pointDisplayB: "0",
        recentScorers: [0, 0, 1],
        completedSets: [{ gamesA: 6, gamesB: 3 }],
      },
    };
    const spectator = toSpectatorState(doc, "AB12CD34")!;
    const { container } = render(<ScoreBoard spectator={spectator} />);

    // History: exactly one concluded set, 6 × 3.
    expect(screen.getByText("6 × 3")).toBeInTheDocument();
    expect(screen.getByText("1º set")).toBeInTheDocument();
    expect(screen.queryByText("2º set")).toBeNull();
    // Scoreboard current games: 4 (A) and 3 (B).
    expect(container.querySelector(".player-row-a .player-games")?.textContent).toBe("4");
    expect(container.querySelector(".player-row-b .player-games")?.textContent).toBe("3");
  });

  const momentBase = {
    setsA: 0,
    setsB: 0,
    gamesA: 5,
    gamesB: 4,
    isTieBreak: false,
    isSuperTieBreak: false,
    currentServer: 1,
    playerAName: "Gustavo",
    playerBName: "João",
    pointDisplayA: "40",
    pointDisplayB: "30",
    recentScorers: [0, 0],
    completedSets: [],
    importantMoment: "SET_POINT",
    pressureMomentPlayer: 0,
  };

  it("shows the important-moment banner while the match is live", () => {
    const live = toSpectatorState({ state: { ...momentBase, status: "LIVE", isMatchOver: false } }, "AB12CD34")!;
    const { container } = render(<ScoreBoard spectator={live} />);
    expect(container.querySelector(".important-moment")?.textContent).toContain("Set Point");
  });

  it("hides the important-moment banner once the match is finished", () => {
    const finished = toSpectatorState(
      { state: { ...momentBase, status: "FINISHED", isMatchOver: true, matchWinner: 0 } },
      "AB12CD34",
    )!;
    const { container } = render(<ScoreBoard spectator={finished} />);
    expect(container.querySelector(".important-moment")).toBeNull();
  });

  it("shows a finished SINGLE_SET result via the sets/games columns published in the contract", () => {
    // A single-set match that ended 6×3. Per the current Firestore contract, games reset to 0 on
    // set win and the per-set 6×3 breakdown (completedSets) is NOT published — only setsA=1 survives.
    // This test pins the real, published behavior; the "Set 1  6×3" history line is a separate
    // contract-change item (see FEATURE-007.1 impact analysis), not something the Web can fabricate.
    const doc: RawLiveMatchDoc = {
      state: {
        status: "FINISHED",
        setsA: 1,
        setsB: 0,
        gamesA: 0,
        gamesB: 0,
        isTieBreak: false,
        isSuperTieBreak: false,
        isMatchOver: true,
        matchWinner: 0,
        currentServer: 0,
        playerAName: "Gustavo",
        playerBName: "Rival",
        pointDisplayA: "0",
        pointDisplayB: "0",
        recentScorers: [],
      },
    };
    const spectator = toSpectatorState(doc, "AB12CD34")!;
    const { container } = render(<ScoreBoard spectator={spectator} />);

    expect(screen.getByText(/Gustavo venceu a partida/)).toBeInTheDocument();
    const rowA = container.querySelector(".player-row-a")!;
    expect(rowA.querySelector(".player-sets")?.textContent).toBe("1");
    expect(rowA.querySelector(".player-games")?.textContent).toBe("0");
    const rowB = container.querySelector(".player-row-b")!;
    expect(rowB.querySelector(".player-sets")?.textContent).toBe("0");
  });
});
