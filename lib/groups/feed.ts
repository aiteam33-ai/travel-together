import { prisma } from "../db/client";

export async function addSystemFeedEntry(groupId: string, text: string) {
  await prisma.groupFeedItem.create({ data: { groupId, type: "SYSTEM", text } });
}
