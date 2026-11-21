import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";

const schema = z.object({
  claim: z.boolean().optional(), // true = claim as me, false = unclaim (only own claim)
  mode: z.enum(["RENT", "OWN"]).optional(),
  done: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, itemId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });

  const item = await prisma.tripChecklistItem.findFirst({ where: { id: itemId, groupId: id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: { claimedByMemberId?: string | null; mode?: string; done?: boolean } = {};
  if (parsed.data.claim === true) data.claimedByMemberId = ctx.membership.id;
  if (parsed.data.claim === false && item.claimedByMemberId === ctx.membership.id) data.claimedByMemberId = null;
  if (parsed.data.mode) data.mode = parsed.data.mode;
  if (parsed.data.done !== undefined) data.done = parsed.data.done;

  const updated = await prisma.tripChecklistItem.update({ where: { id: itemId }, data, include: { claimedBy: true } });
  return NextResponse.json({ ok: true, item: updated });
}
