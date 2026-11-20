import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { getFriendIds } from "@/lib/friends/access";

// Returns the conversation list: every friend, with their last message + unread count.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ conversations: [] });

  const friendIds = await getFriendIds(user.id);
  if (friendIds.length === 0) return NextResponse.json({ conversations: [] });

  const friends = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    select: { id: true, name: true, phone: true },
  });

  const conversations = await Promise.all(
    friends.map(async (friend) => {
      const lastMessage = await prisma.directMessage.findFirst({
        where: {
          OR: [
            { fromUserId: user.id, toUserId: friend.id },
            { fromUserId: friend.id, toUserId: user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      const unreadCount = await prisma.directMessage.count({
        where: { fromUserId: friend.id, toUserId: user.id, readAt: null },
      });
      return { friend, lastMessage, unreadCount };
    })
  );

  conversations.sort((a, b) => {
    const at = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bt = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bt - at;
  });

  return NextResponse.json({ conversations });
}
