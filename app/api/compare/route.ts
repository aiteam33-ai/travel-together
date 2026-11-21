import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").filter(Boolean).slice(0, 3);
  if (ids.length === 0) return NextResponse.json({ tours: [] });

  const tours = await prisma.tour.findMany({
    where: { id: { in: ids } },
    include: { departures: { orderBy: { startDate: "asc" }, include: { cityPrices: true } } },
  });

  const ordered = ids.map((id) => tours.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => !!t);

  const result = ordered.map((t) => {
    const futureDepartures = t.departures.filter((d) => d.startDate >= new Date());
    const nextDeparture = futureDepartures[0];
    const cheapestPricePerPerson = futureDepartures.length
      ? Math.min(...futureDepartures.flatMap((d) => d.cityPrices.map((c) => c.pricePerPerson)))
      : null;
    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      heroImage: t.heroImage,
      durationDays: t.durationDays,
      durationNights: t.durationNights,
      difficulty: t.difficulty,
      category: t.category,
      isInternational: t.isInternational,
      nextDepartureId: nextDeparture?.id ?? null,
      nextDepartureDates: futureDepartures.slice(0, 3).map((d) => d.startDate),
      groupSize: nextDeparture?.totalSeats ?? null,
      cheapestPricePerPerson,
      inclusions: JSON.parse(t.inclusions) as string[],
      exclusions: JSON.parse(t.exclusions) as string[],
      cancellationPolicy: JSON.parse(t.cancellationPolicy) as { daysBefore: number; feePercent: number }[],
    };
  });

  return NextResponse.json({ tours: result });
}
