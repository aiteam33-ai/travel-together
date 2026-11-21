import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

// Polite one-tap nudge posted to the group chat — no payment details leak,
// just a reminder naming the pending member.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; shareId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, shareId } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || !booking.groupId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ctx = await requireMembership(booking.groupId, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const share = await prisma.bookingShare.findFirst({ where: { id: shareId, bookingId: id }, include: { member: true } });
  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (share.status !== "PENDING") return NextResponse.json({ ok: true });

  await addSystemFeedEntry(booking.groupId, `${user.name} nudged ${share.member.name} to pay their trip share.`);

  return NextResponse.json({ ok: true });
}
