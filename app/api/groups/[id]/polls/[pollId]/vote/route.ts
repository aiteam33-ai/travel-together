import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";

const schema = z.object({ optionId: z.string() });

// One vote per member per poll — upsert moves the vote to the new option
// rather than allowing a second one.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; pollId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, pollId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid vote" }, { status: 400 });

  const option = await prisma.pollOption.findFirst({ where: { id: parsed.data.optionId, pollId } });
  if (!option) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.pollVote.upsert({
    where: { pollId_memberId: { pollId, memberId: ctx.membership.id } },
    create: { pollId, optionId: option.id, memberId: ctx.membership.id },
    update: { optionId: option.id },
  });

  const options = await prisma.pollOption.findMany({ where: { pollId }, include: { votes: true } });
  return NextResponse.json({ ok: true, options });
}
