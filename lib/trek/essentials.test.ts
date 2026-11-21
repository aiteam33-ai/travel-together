import { describe, it, expect } from "vitest";
import { deriveBestSeason, flagFitnessMismatches, defaultChecklistItems } from "./essentials";

describe("deriveBestSeason", () => {
  it("flags high-altitude treks for shoulder seasons", () => {
    const season = deriveBestSeason({ category: "TREK", tags: "TREK", isInternational: false, altitudeMeters: 5000 });
    expect(season).toContain("Apr–Jun");
  });
  it("gives pilgrimages a cooler-months window", () => {
    expect(deriveBestSeason({ category: "PILGRIMAGE", tags: "PILGRIMAGE", isInternational: false, altitudeMeters: null })).toContain("Oct–Mar");
  });
});

describe("flagFitnessMismatches", () => {
  it("flags a low fitness rating against a Difficult trek", () => {
    const flags = flagFitnessMismatches("Difficult", [
      { memberId: "m1", fitnessSelfRating: 2 },
      { memberId: "m2", fitnessSelfRating: 5 },
      { memberId: "m3", fitnessSelfRating: null },
    ]);
    expect(flags.find((f) => f.memberId === "m1")?.needsPrep).toBe(true);
    expect(flags.find((f) => f.memberId === "m2")?.needsPrep).toBe(false);
    expect(flags.find((f) => f.memberId === "m3")?.needsPrep).toBe(false);
  });

  it("never flags anyone for an Easy tour", () => {
    const flags = flagFitnessMismatches("Easy", [{ memberId: "m1", fitnessSelfRating: 1 }]);
    expect(flags[0].needsPrep).toBe(false);
  });
});

describe("defaultChecklistItems", () => {
  it("includes gear, generic packing and permits for a trek/pilgrimage", () => {
    const items = defaultChecklistItems({
      category: "TREK",
      gearList: JSON.stringify(["Trekking poles", "Headlamp"]),
      documentsNeeded: JSON.stringify(["Inner line permit"]),
    });
    expect(items.some((i) => i.category === "GEAR" && i.label === "Trekking poles")).toBe(true);
    expect(items.some((i) => i.category === "PACKING")).toBe(true);
    expect(items.some((i) => i.category === "PERMIT" && i.label === "Inner line permit")).toBe(true);
  });

  it("skips permits for a plain domestic tour", () => {
    const items = defaultChecklistItems({ category: "DOMESTIC", gearList: null, documentsNeeded: JSON.stringify(["Photo ID"]) });
    expect(items.some((i) => i.category === "PERMIT")).toBe(false);
  });
});
