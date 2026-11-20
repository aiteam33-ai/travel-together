import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, itemId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ctx.membership.role !== "ORGANISER") return NextResponse.json({ error: "Organiser only" }, { status: 403 });

  const item = await prisma.groupShortlistItem.findFirst({ where: { id: itemId, groupId: id }, include: { tour: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.groupShortlistItem.updateMany({ where: { groupId: id }, data: { selected: false } }),
    prisma.groupShortlistItem.update({ where: { id: itemId }, data: { selected: true } }),
    prisma.group.update({ where: { id }, data: { tourId: item.tourId, departureId: null } }),
  ]);
  await addSystemFeedEntry(id, `"${item.tour.title}" was selected for this trip.`);
  return NextResponse.json({ ok: true });
}
