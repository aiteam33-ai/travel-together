import { prisma } from "../db/client";
import { continentFor, splitCountries } from "../destinations";
import { SEASON_MONTHS, seasonForMonth, type Season } from "../trek/seasons";

export function parseJsonField<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function getTourCounts() {
  const [tourCount, departureCount, travellerAgg] = await Promise.all([
    prisma.tour.count(),
    prisma.departure.count(),
    prisma.departure.aggregate({ _sum: { seatsBooked: true } }),
  ]);
  return {
    tourCount,
    departureCount,
    travellersServed: travellerAgg._sum.seatsBooked ?? 0,
  };
}

export async function getFastFillingDepartures(limit = 8, international?: boolean) {
  const departures = await prisma.departure.findMany({
    where: {
      startDate: { gte: new Date() },
      ...(international !== undefined ? { tour: { isInternational: international } } : {}),
    },
    include: { tour: true },
    orderBy: { startDate: "asc" },
    take: 60,
  });
  return departures
    .map((d) => ({ ...d, seatsLeft: d.totalSeats - d.seatsBooked }))
    .filter((d) => d.seatsLeft > 0 && d.seatsLeft <= 8)
    .slice(0, limit);
}

// Like getFastFillingDepartures, but deduped by tour — a tour with several
// qualifying low-seat departures previously showed as several near-identical
// cards; here it's one card with its qualifying dates as selectable chips.
export async function getFastFillingDeparturesByTour(limit = 6, international?: boolean) {
  const departures = await prisma.departure.findMany({
    where: {
      startDate: { gte: new Date() },
      ...(international !== undefined ? { tour: { isInternational: international } } : {}),
    },
    include: { tour: true },
    orderBy: { startDate: "asc" },
    take: 120,
  });

  const qualifying = departures
    .map((d) => ({ ...d, seatsLeft: d.totalSeats - d.seatsBooked }))
    .filter((d) => d.seatsLeft > 0 && d.seatsLeft <= 8);

  const byTour = new Map<string, typeof qualifying>();
  for (const d of qualifying) {
    const list = byTour.get(d.tourId) ?? [];
    list.push(d);
    byTour.set(d.tourId, list);
  }

  return Array.from(byTour.values())
    .slice(0, limit)
    .map((list) => ({ tour: list[0].tour, departures: list }));
}

export async function listToursForListing(filters: {
  destination?: string;
  category?: string;
  region?: string;
  country?: string;
  tag?: string;
  minBudget?: number;
  maxBudget?: number;
  durationMin?: number;
  durationMax?: number;
  mealPlan?: string;
  difficulty?: string;
  month?: number; // 1-12 — has at least one departure starting in this month
  season?: Season;
  sort?: string;
}) {
  const tours = await prisma.tour.findMany({
    where: {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.region ? { region: filters.region } : {}),
      ...(filters.country ? { country: { contains: filters.country } } : {}),
      ...(filters.destination ? { title: { contains: filters.destination } } : {}),
      ...(filters.mealPlan ? { mealPlan: { contains: filters.mealPlan } } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.tag ? { tags: { contains: filters.tag } } : {}),
    },
    include: {
      departures: { include: { cityPrices: true }, orderBy: { startDate: "asc" } },
    },
  });

  let result = tours.map((tour) => {
    const futureDepartures = tour.departures.filter((d) => d.startDate >= new Date());
    const cheapest = futureDepartures.length
      ? Math.min(...futureDepartures.flatMap((d) => d.cityPrices.map((c) => c.pricePerPerson)))
      : null;
    return { tour, futureDepartures, cheapestPricePerPerson: cheapest };
  });

  if (filters.minBudget) result = result.filter((r) => (r.cheapestPricePerPerson ?? 0) >= filters.minBudget! * 100);
  if (filters.maxBudget) result = result.filter((r) => (r.cheapestPricePerPerson ?? Infinity) <= filters.maxBudget! * 100);
  if (filters.durationMin) result = result.filter((r) => r.tour.durationDays >= filters.durationMin!);
  if (filters.durationMax) result = result.filter((r) => r.tour.durationDays <= filters.durationMax!);
  if (filters.month) result = result.filter((r) => r.futureDepartures.some((d) => d.startDate.getMonth() + 1 === filters.month));
  if (filters.season) {
    const months = SEASON_MONTHS[filters.season];
    result = result.filter((r) => r.futureDepartures.some((d) => months.includes(d.startDate.getMonth() + 1)));
  }

  if (filters.sort === "price_asc") result.sort((a, b) => (a.cheapestPricePerPerson ?? 0) - (b.cheapestPricePerPerson ?? 0));
  else if (filters.sort === "price_desc") result.sort((a, b) => (b.cheapestPricePerPerson ?? 0) - (a.cheapestPricePerPerson ?? 0));
  else if (filters.sort === "duration") result.sort((a, b) => a.tour.durationDays - b.tour.durationDays);

  return result;
}

export async function getFeaturedInternationalTours(limit = 6) {
  const tours = await prisma.tour.findMany({
    where: { isInternational: true },
    include: { departures: { include: { cityPrices: true }, where: { startDate: { gte: new Date() } }, orderBy: { startDate: "asc" } } },
    take: limit,
  });
  return tours
    .map((tour) => {
      const futureDepartures = tour.departures;
      const cheapest = futureDepartures.length
        ? Math.min(...futureDepartures.flatMap((d) => d.cityPrices.map((c) => c.pricePerPerson)))
        : null;
      return { tour, futureDepartures, cheapestPricePerPerson: cheapest };
    })
    .filter((t) => t.futureDepartures.length > 0);
}

export interface DestinationCountry {
  country: string;
  continent: string;
  tourCount: number;
  heroImage: string;
  cheapestPricePerPerson: number | null; // paise
}

// Groups the international catalogue by country (a multi-country tour like
// "Singapore, Malaysia" counts toward each country it visits) and then by
// continent, for the /destinations world-explorer page.
export async function getDestinationsByContinent(): Promise<Record<string, DestinationCountry[]>> {
  const tours = await prisma.tour.findMany({
    where: { isInternational: true, country: { not: null } },
    include: { departures: { include: { cityPrices: true }, where: { startDate: { gte: new Date() } } } },
  });

  const byCountry = new Map<string, { heroImage: string; prices: number[]; tourIds: Set<string> }>();
  for (const tour of tours) {
    const prices = tour.departures.flatMap((d) => d.cityPrices.map((c) => c.pricePerPerson));
    for (const country of splitCountries(tour.country)) {
      const entry = byCountry.get(country) ?? { heroImage: tour.heroImage, prices: [], tourIds: new Set() };
      entry.prices.push(...prices);
      entry.tourIds.add(tour.id);
      byCountry.set(country, entry);
    }
  }

  const countries: DestinationCountry[] = Array.from(byCountry.entries()).map(([country, data]) => ({
    country,
    continent: continentFor(country),
    tourCount: data.tourIds.size,
    heroImage: data.heroImage,
    cheapestPricePerPerson: data.prices.length ? Math.min(...data.prices) : null,
  }));

  const byContinent: Record<string, DestinationCountry[]> = {};
  for (const c of countries) {
    (byContinent[c.continent] ??= []).push(c);
  }
  for (const list of Object.values(byContinent)) {
    list.sort((a, b) => a.country.localeCompare(b.country));
  }
  return byContinent;
}

export interface TrekCategoryFacets {
  months: { month: number; count: number }[]; // months with at least one upcoming trek departure
  seasons: { season: Season; count: number }[];
  difficulties: { difficulty: string; count: number }[];
  experienceTags: { tag: string; count: number }[]; // tags other than "TREK" itself
  durationBuckets: { label: string; min: number; max?: number; count: number }[];
  regions: { region: string; count: number }[];
}

// Everything shown in the "Treks by Categories" browse section — all derived
// from real tour/departure data (never a hardcoded taxonomy), so a bucket
// only appears once there's an actual trek behind it.
export async function getTrekCategoryFacets(): Promise<TrekCategoryFacets> {
  const treks = await prisma.tour.findMany({
    where: { category: "TREK" },
    include: { departures: { where: { startDate: { gte: new Date() } } } },
  });

  const monthCounts = new Map<number, number>();
  const seasonCounts = new Map<Season, number>();
  for (const tour of treks) {
    const months = new Set(tour.departures.map((d) => d.startDate.getMonth() + 1));
    for (const month of months) {
      monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
      const season = seasonForMonth(month);
      seasonCounts.set(season, (seasonCounts.get(season) ?? 0) + 1);
    }
  }

  const difficultyCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  const regionCounts = new Map<string, number>();
  const durationBuckets = [
    { label: "4 days", min: 4, max: 4 },
    { label: "5 days", min: 5, max: 5 },
    { label: "6 days", min: 6, max: 6 },
    { label: "7+ days", min: 7 },
  ].map((b) => ({ ...b, count: 0 }));

  for (const tour of treks) {
    if (tour.difficulty) difficultyCounts.set(tour.difficulty, (difficultyCounts.get(tour.difficulty) ?? 0) + 1);
    if (tour.region) regionCounts.set(tour.region, (regionCounts.get(tour.region) ?? 0) + 1);
    for (const tag of tour.tags.split(",").map((t) => t.trim()).filter(Boolean)) {
      if (tag === "TREK") continue;
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
    for (const bucket of durationBuckets) {
      if (tour.durationDays >= bucket.min && (bucket.max === undefined || tour.durationDays <= bucket.max)) bucket.count++;
    }
  }

  return {
    months: Array.from(monthCounts.entries()).sort((a, b) => a[0] - b[0]).map(([month, count]) => ({ month, count })),
    seasons: Array.from(seasonCounts.entries()).map(([season, count]) => ({ season, count })),
    difficulties: Array.from(difficultyCounts.entries()).map(([difficulty, count]) => ({ difficulty, count })),
    experienceTags: Array.from(tagCounts.entries()).map(([tag, count]) => ({ tag, count })),
    durationBuckets: durationBuckets.filter((b) => b.count > 0),
    regions: Array.from(regionCounts.entries()).map(([region, count]) => ({ region, count })),
  };
}

export async function getTourBySlug(slug: string) {
  return prisma.tour.findUnique({
    where: { slug },
    include: {
      departures: { include: { cityPrices: true }, orderBy: { startDate: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
}
