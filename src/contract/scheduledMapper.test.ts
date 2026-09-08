import { describe, expect, it } from "vitest";
import { toScheduledState } from "./scheduledMapper";
import { toSpectatorState } from "./mapper";
import scheduledFixture from "../testFixtures/scheduled.json";
import liveFixture from "../testFixtures/live.json";
import finishedFixture from "../testFixtures/finished.json";

describe("toScheduledState", () => {
  it("maps a SCHEDULED document with players and format", () => {
    const s = toScheduledState(scheduledFixture, "SC12CD34");
    expect(s).not.toBeNull();
    expect(s!.playerAName).toBe("João");
    expect(s!.playerBName).toBe("Pedro");
    expect(s!.matchTypeLabel).toBe("Melhor de 3");
    expect(s!.scheduledAt).toBe(1789000000000);
    expect(s!.shareCode).toBe("SC12CD34");
  });

  it("maps championship and phase when present", () => {
    const s = toScheduledState(scheduledFixture, "SC12CD34");
    expect(s!.championshipName).toBe("Copa Arena");
    expect(s!.phase).toBe("Semifinal");
  });

  it("tolerates missing optional championship/phase (null, not a failure)", () => {
    const doc = {
      state: {
        status: "SCHEDULED",
        playerAName: "Ana",
        playerBName: "Bruna",
        matchTypeLabel: "Set Único",
        scheduledAt: 1789000000000,
      },
    };
    const s = toScheduledState(doc, "SC12CD34");
    expect(s).not.toBeNull();
    expect(s!.championshipName).toBeNull();
    expect(s!.phase).toBeNull();
    expect(s!.playerAName).toBe("Ana");
  });

  it("falls back to Jogador A/B when player names are absent", () => {
    const s = toScheduledState({ state: { status: "SCHEDULED" } }, "SC12CD34");
    expect(s).not.toBeNull();
    expect(s!.playerAName).toBe("Jogador A");
    expect(s!.playerBName).toBe("Jogador B");
    expect(s!.matchTypeLabel).toBeNull();
    expect(s!.scheduledAt).toBeNull();
  });

  it("returns null for LIVE / FINISHED / legacy documents (not scheduled)", () => {
    expect(toScheduledState(liveFixture, "AB12CD34")).toBeNull();
    expect(toScheduledState(finishedFixture, "AB12CD34")).toBeNull();
    expect(toScheduledState({ state: {} }, "AB12CD34")).toBeNull();
    expect(toScheduledState({}, "AB12CD34")).toBeNull();
  });

  it("the live mapper still rejects a SCHEDULED document (no regression)", () => {
    expect(toSpectatorState(scheduledFixture, "SC12CD34")).toBeNull();
  });
});
