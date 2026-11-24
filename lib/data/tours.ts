import { prisma } from "../db/client";
import { continentFor, splitCountries } from "../destinations";

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

export async function getTourBySlug(slug: string) {
  return prisma.tour.findUnique({
    where: { slug },
    include: {
      departures: { include: { cityPrices: true }, orderBy: { startDate: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
}
