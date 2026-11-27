import { cache } from "react";
import { prisma } from "../db/client";

/**
 * The single server-side gate for group access. A group, its feed and its
 * expenses are visible only to its members — callers should treat `null`
 * as "respond 404", never leak whether the group exists.
 */
export async function getMembership(groupId: string, userId: string) {
  return prisma.groupMember.findFirst({
    where: { groupId, userId, status: { in: ["JOINED"] } },
  });
}

// A group's layout and its page both call this for the same (groupId, userId)
// within one request — cache() dedupes that into one membership + one group
// query instead of two of each.
export const requireMembership = cache(async (groupId: string, userId: string) => {
  const membership = await getMembership(groupId, userId);
  if (!membership) return null;
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return null;
  return { group, membership };
});

export type GroupAccessContext = NonNullable<Awaited<ReturnType<typeof requireMembership>>>;

export async function logEvent(type: string, userId?: string, metadata?: Record<string, unknown>) {
  await prisma.productEvent.create({
    data: { type, userId, metadataJson: metadata ? JSON.stringify(metadata) : null },
  });
}

const INVITE_RATE_LIMIT_PER_HOUR = 20;

export async function checkInviteRateLimit(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.productEvent.count({
    where: { type: "INVITE_SENT", userId, createdAt: { gte: since } },
  });
  return count < INVITE_RATE_LIMIT_PER_HOUR;
}
