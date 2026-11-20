import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

const schema = z.object({
  fromMemberId: z.string(),
  toMemberId: z.string(),
  amountPaise: z.number().int().positive(),
  note: z.string().max(200).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid settlement" }, { status: 400 });

  // Either party can record it — the mover (from) or receiver (to) must be the current member.
  if (ctx.membership.id !== parsed.data.fromMemberId && ctx.membership.id !== parsed.data.toMemberId) {
    return NextResponse.json({ error: "You can only record a settlement you were part of" }, { status: 403 });
  }

  const settlement = await prisma.settlement.create({ data: { groupId: id, ...parsed.data } });

  const [fromMember, toMember] = await Promise.all([
    prisma.groupMember.findUnique({ where: { id: parsed.data.fromMemberId } }),
    prisma.groupMember.findUnique({ where: { id: parsed.data.toMemberId } }),
  ]);
  await addSystemFeedEntry(id, `${fromMember?.name ?? "A member"} paid ${toMember?.name ?? "a member"} ₹${(parsed.data.amountPaise / 100).toLocaleString("en-IN")}.`);

  return NextResponse.json({ ok: true, settlementId: settlement.id });
}
