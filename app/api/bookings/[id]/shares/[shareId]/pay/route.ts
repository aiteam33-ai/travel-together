import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

// Mock pay-your-share: no real payment gateway in this project (same
// convention as the main checkout's mock payment). Only the share's own
// member can pay it.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; shareId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id, shareId } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || !booking.groupId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ctx = await requireMembership(booking.groupId, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const share = await prisma.bookingShare.findFirst({ where: { id: shareId, bookingId: id } });
  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (share.memberId !== ctx.membership.id) {
    return NextResponse.json({ error: "You can only pay your own share." }, { status: 403 });
  }
  if (share.status !== "PENDING") return NextResponse.json({ ok: true });

  await prisma.bookingShare.update({ where: { id: shareId }, data: { status: "PAID", paidAt: new Date() } });
  await prisma.payment.create({
    data: { bookingId: id, amount: share.amountPaise, method: "UPI", status: "SUCCESS" },
  });
  await addSystemFeedEntry(booking.groupId, `${user.name} paid their share of the trip.`);

  await settleBookingIfComplete(id);

  return NextResponse.json({ ok: true });
}

async function settleBookingIfComplete(bookingId: string) {
  const shares = await prisma.bookingShare.findMany({ where: { bookingId } });
  const allSettled = shares.length > 0 && shares.every((s) => s.status !== "PENDING");
  const paidTotal = shares.filter((s) => s.status !== "PENDING").reduce((sum, s) => sum + s.amountPaise, 0);
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return;
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      amountPaid: paidTotal,
      status: allSettled ? "CONFIRMED" : booking.status === "HELD" ? "PARTIALLY_PAID" : booking.status,
    },
  });
}
