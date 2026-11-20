import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 });

  const memberships = await prisma.groupMember.findMany({ where: { userId: user.id, status: "JOINED" }, select: { groupId: true } });
  const groupIds = memberships.map((m) => m.groupId);
  if (groupIds.length === 0) return NextResponse.json({ count: 0 });

  const since = user.lastSocialsViewAt ?? new Date(0);
  const count = await prisma.groupFeedItem.count({
    where: { groupId: { in: groupIds }, createdAt: { gt: since }, deletedAt: null },
  });
  return NextResponse.json({ count });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await prisma.user.update({ where: { id: user.id }, data: { lastSocialsViewAt: new Date() } });
  return NextResponse.json({ ok: true });
}
