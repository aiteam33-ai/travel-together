import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";

// Organiser covers every still-pending share (mock — no real charge).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || !booking.groupId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ctx = await requireMembership(booking.groupId, user.id);
  if (!ctx || ctx.membership.role !== "ORGANISER") {
    return NextResponse.json({ error: "Only the organiser can cover the rest." }, { status: 403 });
  }

  const pending = await prisma.bookingShare.findMany({ where: { bookingId: id, status: "PENDING" } });
  if (pending.length === 0) return NextResponse.json({ ok: true });

  await prisma.bookingShare.updateMany({
    where: { bookingId: id, status: "PENDING" },
    data: { status: "COVERED", paidAt: new Date() },
  });
  const coveredTotal = pending.reduce((sum, s) => sum + s.amountPaise, 0);
  await prisma.payment.create({
    data: { bookingId: id, amount: coveredTotal, method: "UPI", status: "SUCCESS" },
  });

  const allShares = await prisma.bookingShare.findMany({ where: { bookingId: id } });
  const paidTotal = allShares.reduce((sum, s) => sum + s.amountPaise, 0);
  await prisma.booking.update({ where: { id }, data: { amountPaid: paidTotal, status: "CONFIRMED" } });

  await addSystemFeedEntry(booking.groupId, `${user.name} covered the remaining shares for the trip.`);

  return NextResponse.json({ ok: true });
}
