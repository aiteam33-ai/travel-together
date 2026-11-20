import { prisma } from "@/lib/db/client";
import { formatDateIST, formatRupees } from "@/lib/pricing/format";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { tour: true, user: true, departure: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Bookings</h1>
      <table className="mt-4 w-full text-sm">
        <thead><tr className="text-left"><th>Ref</th><th>Tour</th><th>User</th><th>Status</th><th>Paid / Due</th><th>Created</th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-border">
              <td className="py-1">{b.bookingRef}</td>
              <td>{b.tour.title}</td>
              <td>{b.user.name ?? b.user.phone ?? b.user.email}</td>
              <td>{b.status}</td>
              <td>{formatRupees(b.amountPaid)} / {formatRupees(b.amountDue)}</td>
              <td>{formatDateIST(b.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
