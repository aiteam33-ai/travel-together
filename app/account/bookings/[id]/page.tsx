import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { parseJsonField } from "@/lib/data/tours";
import PriceBreakdown from "@/app/components/pricing/PriceBreakdown";
import CancelBookingButton from "@/app/components/account/CancelBookingButton";
import PrintButton from "@/app/components/PrintButton";
import { formatDateIST } from "@/lib/pricing/format";
import { BRAND } from "@/lib/brand";

interface CancellationRule { daysBefore: number; feePercent: number }

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const booking = await prisma.booking.findFirst({ where: { id, userId: user!.id }, include: { tour: true, departure: true, payments: true } });
  if (!booking) notFound();

  const { output } = JSON.parse(booking.pricingSnapshotJson);
  const cancellation = parseJsonField<CancellationRule[]>(booking.tour.cancellationPolicy, []);
  const now = new Date();
  const daysToDeparture = Math.ceil((booking.departure.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const applicableRule = cancellation.find((r) => daysToDeparture >= r.daysBefore) ?? cancellation[cancellation.length - 1];
  const cancellationFeePercent = applicableRule?.feePercent ?? 100;
  const refundAmount = Math.round(booking.amountPaid * (1 - cancellationFeePercent / 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">{booking.tour.title}</h1>
        <p className="text-sm text-foreground-muted">Ref {booking.bookingRef} · {formatDateIST(booking.departure.startDate)} · Status: {booking.status}</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4 print:border-0" id="invoice">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">GST Invoice</h2>
          <div className="flex gap-2">
            <a href={`/api/bookings/${booking.id}/invoice.pdf`} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-1.5 text-sm print:hidden">
              Download PDF
            </a>
            <PrintButton />
          </div>
        </div>
        <p className="mt-2 text-sm">{BRAND.name} · GSTIN {BRAND.gstin}</p>
        <div className="mt-3">
          <PriceBreakdown output={output} />
        </div>
      </section>

      {booking.payments.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Payments</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {booking.payments.map((p) => (
              <li key={p.id}>{formatDateIST(p.createdAt)} · {p.method} · {p.status} · ₹{(p.amount / 100).toLocaleString("en-IN")}</li>
            ))}
          </ul>
        </section>
      )}

      {booking.status !== "CANCELLED" && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Cancel this booking</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Cancelling today ({daysToDeparture} days before departure) applies a {cancellationFeePercent}% fee.
          </p>
          <CancelBookingButton bookingId={booking.id} refundAmount={refundAmount} />
        </section>
      )}
    </div>
  );
}
