import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConnectingScreen, ErrorScreen, InvalidCodeScreen, NotFoundScreen } from "./StatusScreens";

describe("status screens — smoke", () => {
  it("ConnectingScreen renders a connecting message", () => {
    render(<ConnectingScreen />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("NotFoundScreen renders and its back button fires", () => {
    const onBack = vi.fn();
    render(<NotFoundScreen onBack={onBack} />);
    expect(screen.getByText(/não encontrada/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("InvalidCodeScreen renders and its back button fires", () => {
    const onBack = vi.fn();
    render(<InvalidCodeScreen onBack={onBack} />);
    expect(screen.getByText(/inválido/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("ErrorScreen renders without exposing raw error details", () => {
    const onBack = vi.fn();
    render(<ErrorScreen onBack={onBack} />);
    expect(screen.getByText(/Não foi possível carregar/)).toBeInTheDocument();
  });
});
