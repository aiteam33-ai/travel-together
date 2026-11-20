import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { formatDateIST, formatRupees } from "@/lib/pricing/format";

export default async function BookingsPage() {
  const user = await getCurrentUser();
  const bookings = await prisma.booking.findMany({
    where: { userId: user!.id },
    include: { tour: true, departure: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">My bookings</h1>
      {bookings.length === 0 ? (
        <p className="mt-4 text-foreground-muted">No bookings yet. <Link href="/tours" className="underline">Browse tours</Link></p>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/account/bookings/${b.id}`} className="block rounded-xl border border-border bg-surface p-4 hover:border-accent">
              <p className="font-semibold">{b.tour.title}</p>
              <p className="text-sm text-foreground-muted">
                {formatDateIST(b.departure.startDate)} · Ref {b.bookingRef} · Status: {b.status}
              </p>
              <p className="text-sm">Paid {formatRupees(b.amountPaid)} of {formatRupees(b.amountDue)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
