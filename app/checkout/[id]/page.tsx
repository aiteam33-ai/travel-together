import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import PaymentPanel from "@/app/components/checkout/PaymentPanel";
import PriceBreakdown from "@/app/components/pricing/PriceBreakdown";
import CheckoutStepper from "@/app/components/checkout/CheckoutStepper";
import { formatDateIST } from "@/lib/pricing/format";

export default async function CheckoutReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const booking = await prisma.booking.findFirst({
    where: { id, userId: user.id },
    include: { tour: true, departure: true },
  });
  if (!booking) notFound();

  const { output } = JSON.parse(booking.pricingSnapshotJson);
  const { details } = JSON.parse(booking.travellersJson);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6 lg:col-span-2">
        <CheckoutStepper currentStep="Pay" />
      </div>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Review your booking</h1>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="font-semibold">{booking.tour.title}</p>
          <p className="text-sm text-foreground-muted">
            Departure: {formatDateIST(booking.departure.startDate)} · Booking ref: {booking.bookingRef}
          </p>
          <p className="mt-1 text-sm">Status: <strong>{booking.status}</strong></p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Travellers</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {details.map((t: any, i: number) => (
              <li key={i}>{t.name} · Age {t.age} · {t.mealChoice.replace(/_/g, "-")}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-2 font-semibold">Cost breakdown</h2>
          <PriceBreakdown output={output} />
        </div>
      </div>

      <aside className="h-fit lg:sticky lg:top-24">
        <PaymentPanel
          bookingId={booking.id}
          amountDue={booking.amountDue}
          amountPaid={booking.amountPaid}
          status={booking.status}
          holdExpiresAt={booking.holdExpiresAt?.toISOString() ?? null}
        />
      </aside>
    </div>
  );
}
