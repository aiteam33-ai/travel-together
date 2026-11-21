import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";

const schema = z.object({ value: z.enum(["YES", "MAYBE", "NO"]), isVeto: z.boolean().default(false) });

// One Veto per member per trip (group): enforced by checking existing votes
// across the whole group's feed items, not just this one.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, itemId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid vote" }, { status: 400 });

  const item = await prisma.groupFeedItem.findFirst({ where: { id: itemId, groupId: id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.isVeto) {
    const existingVeto = await prisma.vote.findFirst({
      where: { isVeto: true, memberId: ctx.membership.id, feedItem: { groupId: id } },
    });
    if (existingVeto && existingVeto.feedItemId !== itemId) {
      return NextResponse.json({ error: "You've already used your veto for this trip" }, { status: 400 });
    }
  }

  await prisma.vote.upsert({
    where: { feedItemId_memberId: { feedItemId: itemId, memberId: ctx.membership.id } },
    create: { feedItemId: itemId, memberId: ctx.membership.id, value: parsed.data.value, isVeto: parsed.data.isVeto },
    update: { value: parsed.data.value, isVeto: parsed.data.isVeto },
  });

  const votes = await prisma.vote.findMany({ where: { feedItemId: itemId } });
  return NextResponse.json({ ok: true, votes });
}
