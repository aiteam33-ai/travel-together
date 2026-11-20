import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

const schema = z.object({ tourId: z.string() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid tour" }, { status: 400 });

  const existing = await prisma.groupShortlistItem.findFirst({ where: { groupId: id, tourId: parsed.data.tourId } });
  if (existing) return NextResponse.json({ ok: true, itemId: existing.id });

  const tour = await prisma.tour.findUnique({ where: { id: parsed.data.tourId } });
  const item = await prisma.groupShortlistItem.create({
    data: { groupId: id, tourId: parsed.data.tourId, addedByMemberId: ctx.membership.id },
  });
  await addSystemFeedEntry(id, `${ctx.membership.name} added "${tour?.title ?? "a tour"}" to the shortlist.`);
  return NextResponse.json({ ok: true, itemId: item.id });
}
