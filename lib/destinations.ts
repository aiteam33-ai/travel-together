// Continent grouping for international tours' `country` field — a lookup,
// not a DB column, since the catalogue only has a handful of countries today
// and this keeps adding a new one to a one-line edit here.
export const CONTINENT_BY_COUNTRY: Record<string, string> = {
  Singapore: "Asia",
  Malaysia: "Asia",
  Thailand: "Asia",
  UAE: "Asia",
  Indonesia: "Asia",
  Vietnam: "Asia",
  Switzerland: "Europe",
  France: "Europe",
  Nepal: "Asia",
};

export function continentFor(country: string): string {
  return CONTINENT_BY_COUNTRY[country] ?? "Other";
}

// A tour's `country` field can hold more than one country (e.g.
// "Singapore, Malaysia") for multi-country itineraries — split for display
// and for grouping by continent.
export function splitCountries(country: string | null): string[] {
  if (!country) return [];
  return country.split(",").map((c) => c.trim()).filter(Boolean);
}
