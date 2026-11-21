// Trek & Pilgrimage essentials helpers — pure, no I/O.

/** Best-season indicator derived from the tour's existing catalogue fields (category, tags, altitude). */
export function deriveBestSeason(tour: {
  category: string;
  tags: string;
  isInternational: boolean;
  altitudeMeters: number | null;
}): string {
  if (tour.category === "TREK") {
    if ((tour.altitudeMeters ?? 0) > 4000) return "Apr–Jun, Sep–Nov (avoid monsoon and peak winter)";
    return "Mar–Jun, Sep–Nov (avoid heavy monsoon)";
  }
  if (tour.category === "PILGRIMAGE") return "Oct–Mar (cooler, most temples/yatras open)";
  if (tour.tags.includes("WOMEN_ONLY") || tour.tags.includes("HONEYMOON")) return "Oct–Mar (pleasant weather, peak season)";
  if (tour.isInternational) return "Year-round — check the destination's own season before booking";
  return "Nov–Feb (cooler, most comfortable for sightseeing)";
}

const DIFFICULTY_MIN_FITNESS: Record<string, number> = {
  Easy: 1,
  Moderate: 3,
  Difficult: 4,
};

export interface FitnessFlag {
  memberId: string;
  needsPrep: boolean;
}

/** Flags members whose self-assessed fitness (1-5) falls short of the trek's difficulty. */
export function flagFitnessMismatches(
  difficulty: string | null,
  members: { memberId: string; fitnessSelfRating: number | null }[]
): FitnessFlag[] {
  const minRequired = difficulty ? DIFFICULTY_MIN_FITNESS[difficulty] ?? 1 : 1;
  return members.map((m) => ({
    memberId: m.memberId,
    needsPrep: m.fitnessSelfRating != null && m.fitnessSelfRating < minRequired,
  }));
}

/** Default gear/packing/permit items seeded for a group's checklist, derived from the tour's own catalogue fields. */
export function defaultChecklistItems(tour: {
  category: string;
  gearList: string | null; // JSON string array
  documentsNeeded: string; // JSON string array
}): { category: "GEAR" | "PACKING" | "PERMIT"; label: string; mode?: "RENT" | "OWN" }[] {
  const items: { category: "GEAR" | "PACKING" | "PERMIT"; label: string; mode?: "RENT" | "OWN" }[] = [];

  if (tour.gearList) {
    try {
      const gear = JSON.parse(tour.gearList) as string[];
      for (const g of gear) items.push({ category: "GEAR", label: g, mode: "OWN" });
    } catch {
      // ignore malformed gear list
    }
  }

  items.push(
    { category: "PACKING", label: "First-aid kit" },
    { category: "PACKING", label: "Power bank / charger" },
    { category: "PACKING", label: "Reusable water bottle" }
  );

  if (tour.category === "PILGRIMAGE" || tour.category === "TREK") {
    try {
      const docs = JSON.parse(tour.documentsNeeded) as string[];
      for (const d of docs) items.push({ category: "PERMIT", label: d });
    } catch {
      // ignore malformed documents list
    }
  }

  return items;
}
