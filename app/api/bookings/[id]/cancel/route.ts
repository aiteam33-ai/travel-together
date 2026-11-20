import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { parseJsonField } from "@/lib/data/tours";

interface CancellationRule { daysBefore: number; feePercent: number }

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const booking = await prisma.booking.findFirst({ where: { id, userId: user.id }, include: { tour: true, departure: true } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cancellation = parseJsonField<CancellationRule[]>(booking.tour.cancellationPolicy, []);
  const daysToDeparture = Math.ceil((booking.departure.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const applicableRule = cancellation.find((r) => daysToDeparture >= r.daysBefore) ?? cancellation[cancellation.length - 1];
  const feePercent = applicableRule?.feePercent ?? 100;
  const refundAmount = Math.round(booking.amountPaid * (1 - feePercent / 100));

  const seatsHeld = booking.status !== "CANCELLED";
  const travellers = JSON.parse(booking.travellersJson).counts;
  const seatsToRelease = travellers.adults + travellers.childrenWithBed + travellers.childrenWithoutBed;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
    if (seatsHeld) {
      await tx.departure.update({ where: { id: booking.departureId }, data: { seatsBooked: { decrement: seatsToRelease } } });
    }
  });

  return NextResponse.json({ ok: true, refundAmount });
}
