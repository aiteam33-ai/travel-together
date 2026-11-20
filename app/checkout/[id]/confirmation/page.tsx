import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { formatDateIST, formatRupees } from "@/lib/pricing/format";
import { BRAND } from "@/lib/brand";
import BookingConfirmedAnimation from "@/app/components/checkout/BookingConfirmedAnimation";

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const booking = await prisma.booking.findFirst({ where: { id, userId: user.id }, include: { tour: true, departure: true } });
  if (!booking) notFound();

  const { output } = JSON.parse(booking.pricingSnapshotJson);

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-8 text-center print:border-0">
      <BookingConfirmedAnimation bookingRef={booking.bookingRef} />
      <h1 className="font-heading text-2xl font-bold text-success">Booking confirmed!</h1>
      <p className="mt-2 text-foreground-muted">Ref: {booking.bookingRef}</p>
      <div className="mt-6 space-y-1 text-left text-sm">
        <p><strong>{booking.tour.title}</strong></p>
        <p>Departure: {formatDateIST(booking.departure.startDate)}</p>
        <p>Status: {booking.status}</p>
        <p>Amount paid: {formatRupees(booking.amountPaid)} of {formatRupees(booking.amountDue)}</p>
        <p>GSTIN: {BRAND.gstin}</p>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Link href={`/account/bookings/${booking.id}`} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
          View GST invoice
        </Link>
        <Link href="/account/bookings" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white">
          Go to my bookings
        </Link>
      </div>
    </div>
  );
}
