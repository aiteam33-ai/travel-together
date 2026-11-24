import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { allocateBudget } from "@/lib/budget/engine";

const schema = z.object({
  totalPaise: z.number().int().positive(),
  travellers: z.number().int().min(1).max(50),
  days: z.number().int().min(1).max(60).optional(),
});

// The Smart Budget Planner's matching step: given one total budget, split it
// into the standard categories (allocateBudget) and find real upcoming tours
// from the catalogue whose cheapest per-person price times the traveller
// count actually fits — or comes close to — that budget. No AI model is
// involved; this is a deterministic query + ranking over real pricing data
// already in the database, which is why it can run with no external API key.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sp = req.nextUrl.searchParams;
  const parsed = schema.safeParse({
    totalPaise: Number(sp.get("totalPaise")),
    travellers: Number(sp.get("travellers")),
    days: sp.get("days") ? Number(sp.get("days")) : undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { totalPaise, travellers, days } = parsed.data;

  const allocation = allocateBudget(totalPaise);

  const tours = await prisma.tour.findMany({
    where: {
      isInternational: false,
      ...(days ? { durationDays: { gte: Math.max(1, days - 2), lte: days + 3 } } : {}),
    },
    include: { departures: { include: { cityPrices: true }, where: { startDate: { gte: new Date() } } } },
  });

  const candidates = tours
    .map((tour) => {
      const prices = tour.departures.flatMap((d) => d.cityPrices.map((c) => c.pricePerPerson));
      if (prices.length === 0) return null;
      const cheapestPerPerson = Math.min(...prices);
      const totalForGroup = cheapestPerPerson * travellers;
      return {
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        heroImage: tour.heroImage,
        durationDays: tour.durationDays,
        durationNights: tour.durationNights,
        category: tour.category,
        cheapestPerPerson,
        totalForGroup,
        withinBudget: totalForGroup <= totalPaise,
        diffFromBudget: totalForGroup - totalPaise,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null)
    // Within-budget options first (closest to the budget, i.e. best use of
    // it, first); over-budget options after, closest overage first — so the
    // list is always sorted by "best fit" regardless of which side of the
    // budget a tour falls on.
    .sort((a, b) => {
      if (a.withinBudget !== b.withinBudget) return a.withinBudget ? -1 : 1;
      return Math.abs(a.diffFromBudget) - Math.abs(b.diffFromBudget);
    })
    .slice(0, 6);

  return NextResponse.json({
    allocation,
    perPersonPaise: Math.round(totalPaise / travellers),
    matches: candidates,
    anyWithinBudget: candidates.some((c) => c.withinBudget),
  });
}
