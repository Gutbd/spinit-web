import { describe, expect, it } from "vitest";
import { toSpectatorState } from "./mapper";
import type { RawLiveMatchDoc } from "./types";
import liveFixture from "../testFixtures/live.json";
import finishedFixture from "../testFixtures/finished.json";
import afterUndoFixture from "../testFixtures/after_undo.json";
import minimalLegacyFixture from "../testFixtures/minimal_legacy.json";

describe("toSpectatorState — canonical fixtures", () => {
  it("maps the LIVE fixture", () => {
    const result = toSpectatorState(liveFixture as RawLiveMatchDoc, "AB12CD34");
    expect(result).toEqual({
      shareCode: "AB12CD34",
      status: "LIVE",
      playerAName: "Ana",
      playerBName: "Bruna",
      pointsA: "30",
      pointsB: "40",
      gamesA: 4,
      gamesB: 3,
      setsA: 1,
      setsB: 0,
      isTieBreak: false,
      isSuperTieBreak: false,
      currentServer: 1,
      matchWinner: null,
      statusLabel: null,
      recentScorers: [0, 1, 1, 0, 1],
      // live.json predates the FEATURE-007.1 fields, so they default safely (backward compat).
      completedSets: [],
      importantMoment: null,
      pressureMomentPlayer: null,
    });
  });

  it("maps the FINISHED fixture, including matchWinner", () => {
    const result = toSpectatorState(finishedFixture as RawLiveMatchDoc, "AB12CD34");
    expect(result?.status).toBe("FINISHED");
    expect(result?.matchWinner).toBe(0);
    expect(result?.setsA).toBe(2);
  });

  it("maps the AFTER_UNDO fixture with no undo-awareness required", () => {
    const result = toSpectatorState(afterUndoFixture as RawLiveMatchDoc, "AB12CD34");
    expect(result?.pointsA).toBe("30");
    expect(result?.pointsB).toBe("30");
    expect(result?.statusLabel).toBe("DEUCE");
    expect(result?.recentScorers).toEqual([0, 1, 1, 0]);
  });

  it("maps the MINIMAL_LEGACY fixture, defaulting missing optionals safely", () => {
    const result = toSpectatorState(minimalLegacyFixture as RawLiveMatchDoc, "EF56GH78");
    expect(result).not.toBeNull();
    expect(result?.matchWinner).toBeNull();
    expect(result?.statusLabel).toBeNull();
    expect(result?.recentScorers).toEqual([]);
    expect(result?.playerAName).toBe("Jogador A");
    expect(result?.playerBName).toBe("Jogador B");
    // FEATURE-007.1 fields absent in a legacy doc -> safe defaults, never a crash.
    expect(result?.completedSets).toEqual([]);
    expect(result?.importantMoment).toBeNull();
    expect(result?.pressureMomentPlayer).toBeNull();
  });
});

describe("toSpectatorState — FEATURE-007.1 completedSets", () => {
  function docWith(stateExtra: Record<string, unknown>): RawLiveMatchDoc {
    return { state: { ...((liveFixture as RawLiveMatchDoc).state as object), ...stateExtra } };
  }

  it("maps a plain set to gamesA/gamesB with null tiebreak points", () => {
    const result = toSpectatorState(docWith({ completedSets: [{ gamesA: 6, gamesB: 3 }] }), "AB12CD34");
    expect(result?.completedSets).toEqual([{ gamesA: 6, gamesB: 3, tieBreakA: null, tieBreakB: null }]);
  });

  it("preserves multiple concluded sets in order", () => {
    const result = toSpectatorState(
      docWith({
        completedSets: [
          { gamesA: 6, gamesB: 4 },
          { gamesA: 3, gamesB: 6 },
          { gamesA: 6, gamesB: 2 },
        ],
      }),
      "AB12CD34",
    );
    expect(result?.completedSets.map((s) => `${s.gamesA}-${s.gamesB}`)).toEqual(["6-4", "3-6", "6-2"]);
  });

  it("keeps both players' tiebreak points when the set was a tiebreak", () => {
    const result = toSpectatorState(
      docWith({ completedSets: [{ gamesA: 6, gamesB: 6, tieBreakA: 10, tieBreakB: 8 }] }),
      "AB12CD34",
    );
    expect(result?.completedSets[0]).toEqual({ gamesA: 6, gamesB: 6, tieBreakA: 10, tieBreakB: 8 });
  });

  it("drops a malformed set entry rather than fabricating games", () => {
    const result = toSpectatorState(
      docWith({ completedSets: [{ gamesA: 6 }, { gamesA: 6, gamesB: 3 }] }),
      "AB12CD34",
    );
    expect(result?.completedSets).toEqual([{ gamesA: 6, gamesB: 3, tieBreakA: null, tieBreakB: null }]);
  });

  it("nulls a partial tiebreak pair rather than rendering half of it", () => {
    const result = toSpectatorState(
      docWith({ completedSets: [{ gamesA: 6, gamesB: 6, tieBreakA: 10 }] }),
      "AB12CD34",
    );
    expect(result?.completedSets[0]).toEqual({ gamesA: 6, gamesB: 6, tieBreakA: null, tieBreakB: null });
  });
});

describe("toSpectatorState — FEATURE-007.1 important moments", () => {
  function docWith(stateExtra: Record<string, unknown>): RawLiveMatchDoc {
    return { state: { ...((liveFixture as RawLiveMatchDoc).state as object), ...stateExtra } };
  }

  it.each(["BREAK_POINT", "SET_POINT", "MATCH_POINT"] as const)(
    "maps the authoritative moment %s with its pressure player",
    (moment) => {
      const result = toSpectatorState(
        docWith({ importantMoment: moment, pressureMomentPlayer: 1 }),
        "AB12CD34",
      );
      expect(result?.importantMoment).toBe(moment);
      expect(result?.pressureMomentPlayer).toBe(1);
    },
  );

  it("rejects an unknown moment name instead of passing it through", () => {
    const result = toSpectatorState(docWith({ importantMoment: "GAME_POINT" }), "AB12CD34");
    expect(result?.importantMoment).toBeNull();
  });

  it("nulls an out-of-range pressure player", () => {
    const result = toSpectatorState(
      docWith({ importantMoment: "BREAK_POINT", pressureMomentPlayer: 7 }),
      "AB12CD34",
    );
    expect(result?.pressureMomentPlayer).toBeNull();
  });
});

describe("toSpectatorState — malformed / edge inputs", () => {
  it("returns null when a required field is missing", () => {
    const doc = { state: { status: "LIVE", gamesA: 1 } } as unknown as RawLiveMatchDoc;
    expect(toSpectatorState(doc, "AB12CD34")).toBeNull();
  });

  it("returns null when status is an unrecognized value", () => {
    const doc = {
      state: { ...(minimalLegacyFixture as RawLiveMatchDoc).state as object, status: "IN_PROGRESS" },
    } as RawLiveMatchDoc;
    expect(toSpectatorState(doc, "EF56GH78")).toBeNull();
  });

  it("returns null when the top-level state map is absent", () => {
    expect(toSpectatorState({}, "AB12CD34")).toBeNull();
  });

  it("displays points from pointDisplayA/B, never from raw pointsA/pointsB", () => {
    const result = toSpectatorState(liveFixture as RawLiveMatchDoc, "AB12CD34");
    // fixture: pointsA=2 (raw), pointDisplayA="30" — the mapped value must be the display string.
    expect(result?.pointsA).toBe("30");
    expect(result?.pointsA).not.toBe("2");
  });

  it("falls back to Jogador A/B when a player name is blank", () => {
    const state = { ...(liveFixture as RawLiveMatchDoc).state as Record<string, unknown>, playerAName: "" };
    const result = toSpectatorState({ state }, "AB12CD34");
    expect(result?.playerAName).toBe("Jogador A");
  });

  it("drops invalid recentScorers entries instead of failing", () => {
    const state = {
      ...(liveFixture as RawLiveMatchDoc).state as Record<string, unknown>,
      recentScorers: [0, 1, 2, -1, "x", 0],
    };
    const result = toSpectatorState({ state }, "AB12CD34");
    expect(result?.recentScorers).toEqual([0, 1, 0]);
  });
});
