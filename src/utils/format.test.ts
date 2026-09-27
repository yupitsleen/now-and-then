import { describe, it, expect } from "vitest";
import {
  formatDateCompact,
  formatDateLong,
  formatDateStandard,
  getEffectiveDestructionDate,
  hasUnknownDestructionDate,
  sortByEffectiveDestructionDate,
} from "./format";

describe("month-precision date formatting", () => {
  it("formatDateCompact renders YYYY-MM without a day", () => {
    expect(formatDateCompact("2023-12")).toBe("Dec 23");
  });

  it("formatDateStandard renders YYYY-MM without a day", () => {
    expect(formatDateStandard("2023-12")).toBe("Dec 2023");
  });

  it("formatDateLong renders YYYY-MM without a day", () => {
    expect(formatDateLong("2023-11")).toBe("November 2023");
  });

  it("day-precision dates still include the day", () => {
    // UTC-midnight parsing may shift the displayed day by one in negative-offset
    // timezones (pre-existing behavior) — assert a day is rendered, not which one.
    expect(formatDateStandard("2023-12-07")).toMatch(/Dec \d{1,2}, 2023/);
  });
});

describe("getEffectiveDestructionDate", () => {
  it("returns dateDestroyed when available", () => {
    const site = {
      dateDestroyed: "2023-10-15",
      sourceAssessmentDate: "2025-10-06",
    };
    expect(getEffectiveDestructionDate(site)).toBe("2023-10-15");
  });

  it("falls back to sourceAssessmentDate when dateDestroyed is not available", () => {
    const site = {
      dateDestroyed: undefined,
      sourceAssessmentDate: "2025-10-06",
    };
    expect(getEffectiveDestructionDate(site)).toBe("2025-10-06");
  });

  it("returns undefined when neither date is available", () => {
    const site = {
      dateDestroyed: undefined,
      sourceAssessmentDate: undefined,
    };
    expect(getEffectiveDestructionDate(site)).toBeUndefined();
  });

  it("prefers dateDestroyed over sourceAssessmentDate", () => {
    const site = {
      dateDestroyed: "2023-12-01",
      sourceAssessmentDate: "2024-05-27",
    };
    expect(getEffectiveDestructionDate(site)).toBe("2023-12-01");
  });
});

describe("sortByEffectiveDestructionDate", () => {
  it("sorts ascending by effective destruction date", () => {
    const sites = [
      { id: "b", dateDestroyed: "2024-01-01" },
      { id: "a", dateDestroyed: "2023-01-01" },
    ];
    expect(sortByEffectiveDestructionDate(sites).map((s) => s.id)).toEqual(["a", "b"]);
  });

  it("puts sites with no date last", () => {
    const sites = [
      { id: "none", dateDestroyed: undefined },
      { id: "dated", dateDestroyed: "2023-01-01" },
    ];
    expect(sortByEffectiveDestructionDate(sites).map((s) => s.id)).toEqual(["dated", "none"]);
  });

  it("does not mutate the input array", () => {
    const sites = [
      { id: "b", dateDestroyed: "2024-01-01" },
      { id: "a", dateDestroyed: "2023-01-01" },
    ];
    sortByEffectiveDestructionDate(sites);
    expect(sites.map((s) => s.id)).toEqual(["b", "a"]);
  });
});

describe("hasUnknownDestructionDate", () => {
  it("returns false when site has exact destruction date", () => {
    const site = {
      dateDestroyed: "2023-10-15",
      sourceAssessmentDate: "2025-10-06",
    };
    expect(hasUnknownDestructionDate(site)).toBe(false);
  });

  it("returns true when site only has survey date (unknown destruction date)", () => {
    const site = {
      dateDestroyed: undefined,
      sourceAssessmentDate: "2025-10-06",
    };
    expect(hasUnknownDestructionDate(site)).toBe(true);
  });

  it("returns false when site has no dates at all", () => {
    const site = {
      dateDestroyed: undefined,
      sourceAssessmentDate: undefined,
    };
    expect(hasUnknownDestructionDate(site)).toBe(false);
  });

  it("returns false when site has destruction date even if survey date is missing", () => {
    const site = {
      dateDestroyed: "2023-12-01",
      sourceAssessmentDate: undefined,
    };
    expect(hasUnknownDestructionDate(site)).toBe(false);
  });
});
