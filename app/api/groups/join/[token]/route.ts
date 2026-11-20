import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { addSystemFeedEntry } from "@/lib/groups/feed";
import { logEvent } from "@/lib/groups/access";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { token } = await params;

  const link = await prisma.groupInviteLink.findUnique({ where: { token } });
  if (!link || link.revoked || link.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite link has expired or was revoked." }, { status: 410 });
  }

  const existing = await prisma.groupMember.findFirst({ where: { groupId: link.groupId, userId: user.id } });
  if (existing) {
    if (existing.status !== "JOINED") {
      await prisma.groupMember.update({ where: { id: existing.id }, data: { status: "JOINED", consentAt: new Date() } });
    }
    return NextResponse.json({ ok: true, groupId: link.groupId });
  }

  await prisma.groupMember.create({
    data: {
      groupId: link.groupId,
      userId: user.id,
      name: user.name ?? "New member",
      phone: user.phone,
      role: "MEMBER",
      status: "JOINED",
      consentAt: new Date(),
    },
  });
  await addSystemFeedEntry(link.groupId, `${user.name ?? "A new member"} joined.`);
  await logEvent("INVITE_ACCEPTED", user.id, { groupId: link.groupId });

  return NextResponse.json({ ok: true, groupId: link.groupId });
}
