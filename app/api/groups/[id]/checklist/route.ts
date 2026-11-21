import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { defaultChecklistItems } from "@/lib/trek/essentials";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let items = await prisma.tripChecklistItem.findMany({ where: { groupId: id }, include: { claimedBy: true } });

  // First visit: seed the checklist from the group's selected tour, if any.
  if (items.length === 0 && ctx.group.tourId) {
    const tour = await prisma.tour.findUnique({ where: { id: ctx.group.tourId } });
    if (tour) {
      const defaults = defaultChecklistItems(tour);
      if (defaults.length > 0) {
        await prisma.tripChecklistItem.createMany({
          data: defaults.map((d) => ({ groupId: id, category: d.category, label: d.label, mode: d.mode })),
        });
        items = await prisma.tripChecklistItem.findMany({ where: { groupId: id }, include: { claimedBy: true } });
      }
    }
  }

  return NextResponse.json({ items, myMemberId: ctx.membership.id });
}
