import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, memberId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ctx.membership.role !== "ORGANISER") return NextResponse.json({ error: "Organiser only" }, { status: 403 });

  const inAnyExpense = await prisma.expenseParticipant.findFirst({ where: { memberId } });
  const member = await prisma.groupMember.findUnique({ where: { id: memberId } });
  if (!member || member.groupId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (inAnyExpense) {
    await prisma.groupMember.update({ where: { id: memberId }, data: { status: "LEFT" } });
  } else {
    await prisma.groupMember.delete({ where: { id: memberId } });
  }
  await addSystemFeedEntry(id, `${member.name} was removed from the group.`);
  return NextResponse.json({ ok: true, markedLeftOnly: !!inAnyExpense });
}
