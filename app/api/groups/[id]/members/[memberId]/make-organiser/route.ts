import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, memberId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ctx.membership.role !== "ORGANISER") return NextResponse.json({ error: "Organiser only" }, { status: 403 });

  const newOrganiser = await prisma.groupMember.findFirst({ where: { id: memberId, groupId: id, status: "JOINED" } });
  if (!newOrganiser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.groupMember.update({ where: { id: ctx.membership.id }, data: { role: "MEMBER" } }),
    prisma.groupMember.update({ where: { id: memberId }, data: { role: "ORGANISER" } }),
    prisma.group.update({ where: { id }, data: { organiserUserId: newOrganiser.userId ?? ctx.group.organiserUserId } }),
  ]);
  await addSystemFeedEntry(id, `${newOrganiser.name} is now the organiser.`);
  return NextResponse.json({ ok: true });
}
