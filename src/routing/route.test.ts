import { describe, expect, it } from "vitest";
import { liveRoutePath, parseRoute } from "./route";

describe("parseRoute", () => {
  it("routes / to the root screen", () => {
    expect(parseRoute("/")).toEqual({ name: "root" });
  });

  it("routes /live to code entry", () => {
    expect(parseRoute("/live")).toEqual({ name: "codeEntry" });
    expect(parseRoute("/live/")).toEqual({ name: "codeEntry" });
  });

  it("routes /live/{code} to the live route with the raw code", () => {
    expect(parseRoute("/live/AB12CD34")).toEqual({ name: "live", rawCode: "AB12CD34" });
  });

  it("routes /live/{code}/ (trailing slash) to the live route", () => {
    expect(parseRoute("/live/AB12CD34/")).toEqual({ name: "live", rawCode: "AB12CD34" });
  });

  it("passes a malformed code through as-is — validation happens in the mapper/UI layer", () => {
    expect(parseRoute("/live/not-a-code")).toEqual({ name: "live", rawCode: "not-a-code" });
  });

  it("treats any other unknown path as code entry (no dedicated 404 page)", () => {
    expect(parseRoute("/something-else")).toEqual({ name: "codeEntry" });
  });

  // FEATURE-008 — private Remote Scorekeeper invite route (App-only fallback on the Web).
  it("routes /control-invite/{shareCode}/{token} extracting both parts", () => {
    expect(parseRoute("/control-invite/DD098455/t0KhCYZ9iSZoeE7h-8kX2g")).toEqual({
      name: "controlInvite",
      shareCode: "DD098455",
      token: "t0KhCYZ9iSZoeE7h-8kX2g",
    });
  });

  it("routes /control-invite/{shareCode}/{token}/ (trailing slash)", () => {
    expect(parseRoute("/control-invite/CODE/TOKEN/")).toEqual({
      name: "controlInvite",
      shareCode: "CODE",
      token: "TOKEN",
    });
  });

  it("does not treat a malformed /control-invite (missing token) as an invite", () => {
    expect(parseRoute("/control-invite/only-one-part")).toEqual({ name: "codeEntry" });
  });

  it("keeps /live/{code} working alongside the new invite route", () => {
    expect(parseRoute("/live/DD098455")).toEqual({ name: "live", rawCode: "DD098455" });
  });
});

describe("liveRoutePath", () => {
  it("builds the /live/{code} path", () => {
    expect(liveRoutePath("AB12CD34")).toBe("/live/AB12CD34");
  });
});
