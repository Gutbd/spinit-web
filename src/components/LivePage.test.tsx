import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LivePage } from "./LivePage";

describe("LivePage — invalid code path (must not touch Firebase)", () => {
  it("shows the invalid-code screen for a malformed code, without querying Firestore", () => {
    render(<LivePage rawCode="not-a-code" onBack={vi.fn()} />);
    expect(screen.getByText(/código inválido/i)).toBeInTheDocument();
  });
});
