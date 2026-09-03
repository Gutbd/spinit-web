import { describe, expect, it } from "vitest";
import { normalizeShareCode } from "./shareCode";

describe("normalizeShareCode", () => {
  it("accepts a bare uppercase code unchanged", () => {
    expect(normalizeShareCode("AB12CD34")).toEqual({ valid: true, code: "AB12CD34" });
  });

  it("uppercases a lowercase code", () => {
    expect(normalizeShareCode("ab12cd34")).toEqual({ valid: true, code: "AB12CD34" });
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeShareCode("  AB12CD34  ")).toEqual({ valid: true, code: "AB12CD34" });
  });

  it("extracts the code from the legacy spinit.com.br URL", () => {
    expect(normalizeShareCode("https://spinit.com.br/live/AB12CD34")).toEqual({
      valid: true,
      code: "AB12CD34",
    });
  });

  it("extracts the code from the live.spinit.com.br URL", () => {
    expect(normalizeShareCode("https://live.spinit.com.br/live/AB12CD34")).toEqual({
      valid: true,
      code: "AB12CD34",
    });
  });

  it("extracts the code ignoring a trailing slash/query/fragment", () => {
    expect(normalizeShareCode("https://live.spinit.com.br/live/AB12CD34?utm=x")).toEqual({
      valid: true,
      code: "AB12CD34",
    });
  });

  it("rejects the wrong length", () => {
    expect(normalizeShareCode("AB12CD3")).toEqual({ valid: false });
    expect(normalizeShareCode("AB12CD345")).toEqual({ valid: false });
  });

  it("rejects non-hex characters", () => {
    expect(normalizeShareCode("ZZ12CD34")).toEqual({ valid: false });
  });

  it("rejects an empty string", () => {
    expect(normalizeShareCode("")).toEqual({ valid: false });
  });
});
