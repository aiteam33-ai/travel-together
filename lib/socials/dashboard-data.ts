import { prisma } from "@/lib/db/client";
import { getFriendIds } from "@/lib/friends/access";

// Shared data for the three dedicated My Socials pages (invite, plan,
// book-split) and the hub page — kept in one place so each page's query
// shape can't silently drift from the others.
export async function getSocialsDashboardData(userId: string) {
  const [memberships, friendIds, incomingRequests, unreadDMs] = await Promise.all([
    prisma.groupMember.findMany({
      where: { userId, status: "JOINED" },
      include: {
        group: {
          include: {
            tour: true,
            members: true,
            bookings: { orderBy: { createdAt: "desc" }, take: 1 },
            shortlist: true,
            expenses: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getFriendIds(userId),
    prisma.friendRequest.count({ where: { toUserId: userId, status: "PENDING" } }),
    prisma.directMessage.count({ where: { toUserId: userId, readAt: null } }),
  ]);

  const friends = friendIds.length
    ? await prisma.user.findMany({ where: { id: { in: friendIds } }, select: { id: true, name: true } })
    : [];

  const groups = memberships.map((m) => m.group);
  const upcomingTrips = groups.filter((g) => g.bookings[0] && g.bookings[0].status !== "CANCELLED");

  return { groups, friends, incomingRequests, unreadDMs, upcomingTrips };
}
