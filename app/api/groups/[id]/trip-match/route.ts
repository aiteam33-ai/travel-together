import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { listToursForListing } from "@/lib/data/tours";
import { pickTripMatches, type CatalogueTour, type MemberVibe } from "@/lib/match/engine";
import type { InterestChip } from "@/lib/pricing/constants";

// "Find our perfect trip": scores the existing catalogue against every
// member's Vibe Check preferences. Secret budgets are read server-side only
// to compute scores/warnings — never included in this response.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const preferences = await prisma.memberPreference.findMany({
    where: { member: { groupId: id, status: "JOINED" } },
  });
  if (preferences.length === 0) {
    return NextResponse.json({ error: "No one has shared Vibe Check preferences yet" }, { status: 400 });
  }

  const members: MemberVibe[] = preferences.map((p) => ({
    memberId: p.memberId,
    pace: p.pace,
    interests: (p.interests ? p.interests.split(",") : []) as InterestChip[],
    foodPreference: p.foodPreference,
    stayPreference: p.stayPreference,
    secretBudgetPaise: p.secretBudgetPaise,
  }));

  const listing = await listToursForListing({});
  const catalogue: CatalogueTour[] = listing.map(({ tour, cheapestPricePerPerson }) => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    category: tour.category,
    tags: tour.tags,
    summary: tour.summary,
    durationDays: tour.durationDays,
    difficulty: tour.difficulty,
    mealPlan: tour.mealPlan,
    cheapestPricePerPerson,
  }));

  const picks = pickTripMatches(catalogue, members);
  const tourById = new Map(listing.map((r) => [r.tour.id, r.tour]));

  const results = picks.map((pick) => {
    const tour = tourById.get(pick.result.tourId)!;
    return {
      label: pick.label,
      tourId: tour.id,
      slug: tour.slug,
      title: tour.title,
      groupScore: pick.result.groupScore,
      averageScore: pick.result.averageScore,
      memberScores: pick.result.memberScores.map((s) => ({ memberId: s.memberId, score: s.score })), // budgetStretched omitted per member
      budgetWarning: pick.result.budgetWarning,
      pricePerPerson: pick.result.pricePerPerson,
    };
  });

  return NextResponse.json({ results });
}
