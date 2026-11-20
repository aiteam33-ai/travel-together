import { prisma } from "../db/client";

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

export async function getFastFillingDepartures(limit = 8) {
  const departures = await prisma.departure.findMany({
    where: { startDate: { gte: new Date() } },
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

export async function getTourBySlug(slug: string) {
  return prisma.tour.findUnique({
    where: { slug },
    include: {
      departures: { include: { cityPrices: true }, orderBy: { startDate: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
}
