import { describe, it, expect } from "vitest";
import { stepIndex } from "./SiteStepper";

describe("stepIndex", () => {
  it("Next from nothing selected picks the first site", () => {
    expect(stepIndex(-1, 1, 5)).toBe(0);
  });
  it("Prev from nothing selected is disabled", () => {
    expect(stepIndex(-1, -1, 5)).toBeNull();
  });
  it("clamps at the start", () => {
    expect(stepIndex(0, -1, 5)).toBeNull();
  });
  it("clamps at the end", () => {
    expect(stepIndex(4, 1, 5)).toBeNull();
  });
  it("steps forward in the middle", () => {
    expect(stepIndex(2, 1, 5)).toBe(3);
  });
  it("steps backward in the middle", () => {
    expect(stepIndex(2, -1, 5)).toBe(1);
  });
  it("returns null for an empty list", () => {
    expect(stepIndex(-1, 1, 0)).toBeNull();
  });
});
