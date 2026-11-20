import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").filter(Boolean).slice(0, 3);
  if (ids.length === 0) return NextResponse.json({ tours: [] });

  const tours = await prisma.tour.findMany({
    where: { id: { in: ids } },
    include: { departures: { orderBy: { startDate: "asc" } } },
  });

  const ordered = ids.map((id) => tours.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => !!t);

  const result = ordered.map((t) => {
    const nextDeparture = t.departures.find((d) => d.startDate >= new Date());
    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      heroImage: t.heroImage,
      durationDays: t.durationDays,
      isInternational: t.isInternational,
      nextDepartureId: nextDeparture?.id ?? null,
    };
  });

  return NextResponse.json({ tours: result });
}
