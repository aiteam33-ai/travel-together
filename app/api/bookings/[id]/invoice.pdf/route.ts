import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { generateInvoicePdf } from "@/lib/pdf/invoice";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const booking = await prisma.booking.findFirst({ where: { id, userId: user.id }, include: { tour: true, departure: true } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { output } = JSON.parse(booking.pricingSnapshotJson);
  const { details } = JSON.parse(booking.travellersJson);

  const pdfBytes = await generateInvoicePdf({
    bookingRef: booking.bookingRef,
    tourTitle: booking.tour.title,
    departureDate: booking.departure.startDate,
    travellerNames: details.map((t: { name: string }) => t.name),
    output,
    amountPaid: booking.amountPaid,
    amountDue: booking.amountDue,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${booking.bookingRef}.pdf"`,
    },
  });
}
