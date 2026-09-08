import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PreMatchScreen } from "./PreMatchScreen";
import type { ScheduledState } from "../contract/types";

const base: ScheduledState = {
  shareCode: "SC12CD34",
  playerAName: "João",
  playerBName: "Pedro",
  matchTypeLabel: "Melhor de 3",
  championshipName: "Copa Arena",
  phase: "Semifinal",
  scheduledAt: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days ahead
};

describe("PreMatchScreen", () => {
  it("renders the PARTIDA AGENDADA status, players and format", () => {
    render(<PreMatchScreen scheduled={base} />);
    expect(screen.getByText("PARTIDA AGENDADA")).toBeInTheDocument();
    expect(screen.getByText("João")).toBeInTheDocument();
    expect(screen.getByText("Pedro")).toBeInTheDocument();
    expect(screen.getByText("Melhor de 3")).toBeInTheDocument();
  });

  it("renders championship and phase when present", () => {
    render(<PreMatchScreen scheduled={base} />);
    expect(screen.getByText("Copa Arena")).toBeInTheDocument();
    expect(screen.getByText("Semifinal")).toBeInTheDocument();
  });

  it("does not break when championship and phase are missing", () => {
    render(<PreMatchScreen scheduled={{ ...base, championshipName: null, phase: null }} />);
    expect(screen.getByText("PARTIDA AGENDADA")).toBeInTheDocument();
    expect(screen.queryByText("Copa Arena")).not.toBeInTheDocument();
    expect(screen.queryByText("Semifinal")).not.toBeInTheDocument();
  });

  it("renders a live countdown for a future scheduled time", () => {
    render(<PreMatchScreen scheduled={base} />);
    expect(screen.getByText(/^Começa em /)).toBeInTheDocument();
  });

  it("renders the passed message when the scheduled time is in the past", () => {
    render(<PreMatchScreen scheduled={{ ...base, scheduledAt: Date.now() - 60_000 }} />);
    expect(screen.getByText("Horário previsto atingido")).toBeInTheDocument();
  });
});
