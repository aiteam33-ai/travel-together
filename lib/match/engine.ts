// Pure, unit-tested AI Trip Match engine for My Socials group trip planning.
// Scores tours from the existing catalogue against each member's Vibe Check
// preferences. No external AI call — deterministic scoring so results are
// explainable and testable, same spirit as lib/pricing/engine.ts.
//
// Fairness rule: the group's score for a tour is the LOWEST member score,
// not the average — a tour that thrills 5 people and alienates 1 should not
// outrank one everyone's happy with.

import type { InterestChip } from "../pricing/constants";

export interface CatalogueTour {
  id: string;
  slug: string;
  title: string;
  category: string; // TourCategory
  tags: string; // comma-separated TravellerTag
  summary: string;
  durationDays: number;
  difficulty: string | null;
  mealPlan: string; // comma-separated MealPlanType offered
  cheapestPricePerPerson: number | null; // paise
}

export interface MemberVibe {
  memberId: string;
  pace: number; // 1-5
  interests: InterestChip[];
  foodPreference: string | null; // FOOD_PREFERENCES
  stayPreference: string | null; // STAY_PREFERENCES
  secretBudgetPaise: number | null;
}

const KEYWORD_INTERESTS: Record<InterestChip, string[]> = {
  TREKS: ["trek", "hike", "summit", "base camp"],
  BEACHES: ["beach", "backwater", "island", "coast"],
  HERITAGE: ["heritage", "fort", "palace", "temple", "golden triangle"],
  SPIRITUAL: ["yatra", "pilgrimage", "spiritual", "temple", "bodh gaya", "varanasi"],
  FOOD: ["food", "cuisine", "culinary"],
  ADVENTURE: ["adventure", "bike", "rafting", "gondola", "landscape"],
  NIGHTLIFE: ["nightlife", "honeymoon", "resort"],
  NATURE: ["valley", "hills", "wildlife", "landscape", "nature"],
};

/** Derives which interest chips a tour satisfies from its existing catalogue fields (category, tags, summary). */
export function deriveTourInterests(tour: CatalogueTour): InterestChip[] {
  const haystack = `${tour.title} ${tour.summary} ${tour.tags}`.toLowerCase();
  const fromCategory: InterestChip[] =
    tour.category === "TREK" ? ["TREKS", "ADVENTURE", "NATURE"] : tour.category === "PILGRIMAGE" ? ["SPIRITUAL", "HERITAGE"] : [];

  const fromKeywords = (Object.keys(KEYWORD_INTERESTS) as InterestChip[]).filter((chip) =>
    KEYWORD_INTERESTS[chip].some((kw) => haystack.includes(kw))
  );

  return Array.from(new Set([...fromCategory, ...fromKeywords]));
}

/** Derives an approximate pace (1 Relaxed .. 5 Packed) from category/difficulty — the only duration-shaped signal the catalogue has. */
export function deriveTourPace(tour: CatalogueTour): number {
  if (tour.category === "TREK") return tour.difficulty === "Difficult" ? 5 : tour.difficulty === "Moderate" ? 4 : 3;
  if (tour.tags.includes("SENIOR_CITIZENS") || tour.tags.includes("FAMILY")) return 2;
  if (tour.tags.includes("HONEYMOON")) return 2;
  return 3;
}

export interface MemberMatchScore {
  memberId: string;
  score: number; // 0-100
  budgetStretched: boolean;
}

export interface TourMatchResult {
  tourId: string;
  groupScore: number; // = min(memberScores) — the fairness rule
  averageScore: number;
  memberScores: MemberMatchScore[];
  pricePerPerson: number | null;
  budgetWarning: boolean; // true if >=1 member is stretched, without naming them
}

function scoreTourForMember(tour: CatalogueTour, member: MemberVibe): MemberMatchScore {
  const tourInterests = deriveTourInterests(tour);
  const tourPace = deriveTourPace(tour);

  let score = 50; // baseline

  // Interest overlap: up to +35
  if (member.interests.length > 0) {
    const overlap = member.interests.filter((i) => tourInterests.includes(i)).length;
    score += Math.round((overlap / member.interests.length) * 35);
  }

  // Pace closeness: up to +15, penalised by distance
  score += Math.max(0, 15 - Math.abs(member.pace - tourPace) * 5);

  // Food preference: tour must offer a compatible meal plan
  if (member.foodPreference && member.foodPreference !== "ANY") {
    const offered = tour.mealPlan.split(",").map((m) => m.trim());
    if (!offered.includes(member.foodPreference)) score -= 15;
  }

  // Budget fit: compare price per person to the member's secret budget
  let budgetStretched = false;
  if (member.secretBudgetPaise != null && tour.cheapestPricePerPerson != null) {
    const ratio = tour.cheapestPricePerPerson / member.secretBudgetPaise;
    if (ratio <= 1) {
      score += 10; // comfortably within budget
    } else if (ratio <= 1.15) {
      budgetStretched = true; // a modest stretch
    } else {
      budgetStretched = true;
      score -= Math.min(30, Math.round((ratio - 1) * 60)); // meaningfully over budget
    }
  }

  return { memberId: member.memberId, score: Math.max(0, Math.min(100, Math.round(score))), budgetStretched };
}

/** Scores one tour for the whole group. Group score is the lowest member score (fairness rule). */
export function scoreTourForGroup(tour: CatalogueTour, members: MemberVibe[]): TourMatchResult {
  const memberScores = members.map((m) => scoreTourForMember(tour, m));
  const scores = memberScores.map((s) => s.score);
  const groupScore = scores.length ? Math.min(...scores) : 0;
  const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return {
    tourId: tour.id,
    groupScore,
    averageScore,
    memberScores,
    pricePerPerson: tour.cheapestPricePerPerson,
    budgetWarning: memberScores.some((s) => s.budgetStretched),
  };
}

export interface TripMatchPick {
  label: "Budget Pick" | "Best Match" | "Premium Pick";
  result: TourMatchResult;
}

/**
 * Picks up to 3 tours from the catalogue: the best-fairness-scored tour
 * overall ("Best Match"), and from the remaining well-scoring tours, the
 * cheapest ("Budget Pick") and priciest ("Premium Pick") per person.
 */
export function pickTripMatches(tours: CatalogueTour[], members: MemberVibe[], count = 3): TripMatchPick[] {
  const scored = tours
    .map((tour) => scoreTourForGroup(tour, members))
    .filter((r) => r.pricePerPerson != null)
    .sort((a, b) => b.groupScore - a.groupScore);

  if (scored.length === 0) return [];

  const picks: TripMatchPick[] = [];
  const used = new Set<string>();

  const best = scored[0];
  picks.push({ label: "Best Match", result: best });
  used.add(best.tourId);

  const pool = scored.slice(0, Math.max(10, Math.ceil(scored.length / 2))); // reasonably well-matched candidates
  const byPrice = [...pool].filter((r) => !used.has(r.tourId)).sort((a, b) => (a.pricePerPerson ?? 0) - (b.pricePerPerson ?? 0));

  if (byPrice.length > 0) {
    const cheapest = byPrice[0];
    picks.push({ label: "Budget Pick", result: cheapest });
    used.add(cheapest.tourId);
  }
  if (byPrice.length > 1) {
    const priciest = byPrice[byPrice.length - 1];
    if (!used.has(priciest.tourId)) {
      picks.push({ label: "Premium Pick", result: priciest });
      used.add(priciest.tourId);
    }
  }

  return picks.slice(0, count);
}
