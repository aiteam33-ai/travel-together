import { prisma } from "../db/client";

/** Friends are derived from accepted FriendRequest rows in either direction. */
export async function getFriendIds(userId: string): Promise<string[]> {
  const accepted = await prisma.friendRequest.findMany({
    where: { status: "ACCEPTED", OR: [{ fromUserId: userId }, { toUserId: userId }] },
  });
  return accepted.map((r) => (r.fromUserId === userId ? r.toUserId : r.fromUserId));
}

export async function areFriends(userId: string, otherUserId: string): Promise<boolean> {
  const friendIds = await getFriendIds(userId);
  return friendIds.includes(otherUserId);
}
