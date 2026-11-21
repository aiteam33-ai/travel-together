import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

// Any member can mark an SOS resolved (e.g. the person who raised it, once
// they're safe) — not gated to the organiser, since the person in trouble
// may not be the organiser.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; alertId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, alertId } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const alert = await prisma.sosAlert.findFirst({ where: { id: alertId, groupId: id } });
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (alert.resolvedAt) return NextResponse.json({ ok: true });

  await prisma.sosAlert.update({ where: { id: alertId }, data: { resolvedAt: new Date() } });
  await addSystemFeedEntry(id, `${user.name} marked the SOS alert as resolved.`);

  return NextResponse.json({ ok: true });
}
