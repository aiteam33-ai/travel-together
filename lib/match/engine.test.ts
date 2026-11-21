import { describe, it, expect } from "vitest";
import { deriveTourInterests, scoreTourForGroup, pickTripMatches, type CatalogueTour, type MemberVibe } from "./engine";

const trek: CatalogueTour = {
  id: "t1",
  slug: "everest-base-camp",
  title: "Everest Base Camp Trek",
  category: "TREK",
  tags: "TREK",
  summary: "A high-altitude trek through the Himalayas.",
  durationDays: 14,
  difficulty: "Difficult",
  mealPlan: "VEG,NON_VEG",
  cheapestPricePerPerson: 9850000, // Rs. 98,500
};

const beach: CatalogueTour = {
  id: "t2",
  slug: "goa-beaches",
  title: "Goa Beaches & Heritage",
  category: "DOMESTIC",
  tags: "FAMILY",
  summary: "Relaxed beach holiday with heritage walks.",
  durationDays: 5,
  difficulty: null,
  mealPlan: "VEG,NON_VEG,JAIN",
  cheapestPricePerPerson: 2400000, // Rs. 24,000
};

describe("deriveTourInterests", () => {
  it("tags a trek as TREKS/ADVENTURE/NATURE", () => {
    expect(deriveTourInterests(trek)).toEqual(expect.arrayContaining(["TREKS", "ADVENTURE", "NATURE"]));
  });
  it("tags a beach+heritage tour from keywords", () => {
    const interests = deriveTourInterests(beach);
    expect(interests).toEqual(expect.arrayContaining(["BEACHES", "HERITAGE"]));
  });
});

describe("scoreTourForGroup", () => {
  it("uses the lowest member score as the group score (fairness rule)", () => {
    const members: MemberVibe[] = [
      { memberId: "m1", pace: 5, interests: ["TREKS"], foodPreference: "ANY", stayPreference: null, secretBudgetPaise: 10000000 },
      { memberId: "m2", pace: 2, interests: ["BEACHES"], foodPreference: "ANY", stayPreference: null, secretBudgetPaise: 3000000 },
    ];
    const result = scoreTourForGroup(trek, members);
    const scores = result.memberScores.map((s) => s.score);
    expect(result.groupScore).toBe(Math.min(...scores));
    expect(result.groupScore).toBeLessThanOrEqual(result.averageScore);
  });

  it("flags a budget warning without naming the member", () => {
    const members: MemberVibe[] = [
      { memberId: "m1", pace: 3, interests: [], foodPreference: null, stayPreference: null, secretBudgetPaise: 1000000 },
    ];
    const result = scoreTourForGroup(trek, members); // Rs 98,500 >> Rs 10,000 budget
    expect(result.budgetWarning).toBe(true);
    expect(result.memberScores[0].budgetStretched).toBe(true);
    // the result never carries the member's name, only memberId + budgetStretched
    expect(Object.keys(result.memberScores[0])).toEqual(["memberId", "score", "budgetStretched"]);
  });

  it("rewards staying within budget", () => {
    const members: MemberVibe[] = [
      { memberId: "m1", pace: 2, interests: ["BEACHES"], foodPreference: "ANY", stayPreference: null, secretBudgetPaise: 5000000 },
    ];
    const result = scoreTourForGroup(beach, members);
    expect(result.memberScores[0].budgetStretched).toBe(false);
  });
});

describe("pickTripMatches", () => {
  it("returns distinct Best Match / Budget Pick / Premium Pick", () => {
    const members: MemberVibe[] = [
      { memberId: "m1", pace: 3, interests: ["BEACHES", "HERITAGE"], foodPreference: "ANY", stayPreference: null, secretBudgetPaise: 5000000 },
    ];
    const picks = pickTripMatches([trek, beach], members);
    expect(picks.length).toBeGreaterThan(0);
    const ids = picks.map((p) => p.result.tourId);
    expect(new Set(ids).size).toBe(ids.length); // no duplicate tour across picks
  });

  it("returns nothing for an empty catalogue", () => {
    expect(pickTripMatches([], [])).toEqual([]);
  });
});
