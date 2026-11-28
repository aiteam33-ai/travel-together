// Indian seasonal grouping used only for the "Treks by season" facet —
// coarser buckets over the same real departure-month data as "by month".
export const SEASONS = ["WINTER", "SUMMER", "MONSOON", "AUTUMN"] as const;
export type Season = (typeof SEASONS)[number];

export const SEASON_LABELS: Record<Season, string> = {
  WINTER: "Winter",
  SUMMER: "Summer",
  MONSOON: "Monsoon",
  AUTUMN: "Autumn",
};

// Month numbers (1-12) belonging to each season.
export const SEASON_MONTHS: Record<Season, number[]> = {
  WINTER: [12, 1, 2],
  SUMMER: [3, 4, 5, 6],
  MONSOON: [7, 8, 9],
  AUTUMN: [10, 11],
};

export function seasonForMonth(month: number): Season {
  for (const season of SEASONS) {
    if (SEASON_MONTHS[season].includes(month)) return season;
  }
  return "WINTER";
}

export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
