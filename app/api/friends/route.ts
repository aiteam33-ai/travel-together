import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { getFriendIds } from "@/lib/friends/access";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ friends: [], incoming: [], outgoing: [] });

  const friendIds = await getFriendIds(user.id);
  const friends = friendIds.length
    ? await prisma.user.findMany({ where: { id: { in: friendIds } }, select: { id: true, name: true, phone: true } })
    : [];

  const incoming = await prisma.friendRequest.findMany({
    where: { toUserId: user.id, status: "PENDING" },
    include: { fromUser: { select: { id: true, name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
  const outgoing = await prisma.friendRequest.findMany({
    where: { fromUserId: user.id, status: "PENDING" },
    include: { toUser: { select: { id: true, name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ friends, incoming, outgoing });
}
