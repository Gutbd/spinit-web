import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CodeEntry } from "./CodeEntry";

describe("CodeEntry — smoke", () => {
  it("normalizes and submits a valid code", () => {
    const onSubmitCode = vi.fn();
    render(<CodeEntry onSubmitCode={onSubmitCode} />);

    fireEvent.change(screen.getByLabelText(/código da partida/i), { target: { value: "ab12cd34" } });
    fireEvent.click(screen.getByRole("button", { name: /assistir/i }));

    expect(onSubmitCode).toHaveBeenCalledWith("AB12CD34");
  });

  it("shows a hint and does not submit for an invalid code", () => {
    const onSubmitCode = vi.fn();
    render(<CodeEntry onSubmitCode={onSubmitCode} />);

    fireEvent.change(screen.getByLabelText(/código da partida/i), { target: { value: "nope" } });
    fireEvent.click(screen.getByRole("button", { name: /assistir/i }));

    expect(onSubmitCode).not.toHaveBeenCalled();
    expect(screen.getByText(/código inválido/i)).toBeInTheDocument();
  });
});
