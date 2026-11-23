import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSocialsDashboardData } from "@/lib/socials/dashboard-data";
import { formatRupees } from "@/lib/pricing/format";

export const metadata = {
  title: "Book and split expenses | My Socials",
};

// Step 3 of My Socials, its own standalone page.
export default async function BookAndSplitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/?login=1&next=/socials/book-split");

  const { groups, upcomingTrips } = await getSocialsDashboardData(user.id);

  return (
    <div className="max-w-3xl">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-accent">My Socials · Step 3</p>
      <h1 className="font-heading mt-2 text-2xl font-bold">Book and split expenses</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        One person books for the group; everyone pays their own share and can record shared expenses.
      </p>

      {groups.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold">No groups yet</p>
          <p className="mt-1 text-sm text-foreground-muted">
            <Link href="/socials/invite" className="text-accent underline underline-offset-2">Create a group</Link> to start booking and splitting costs.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {groups.map((group) => {
            const totalExpense = group.expenses.reduce((sum, e) => sum + e.amountPaise, 0);
            const booking = group.bookings[0];
            return (
              <div key={group.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                <div>
                  <p className="font-semibold">{group.name}</p>
                  <p className="text-sm text-foreground-muted">
                    {booking ? `Booking ${booking.status}` : "Not booked yet"}
                    {group.expenses.length > 0 && <> · {formatRupees(totalExpense)} in shared expenses</>}
                  </p>
                </div>
                <Link
                  href={`/socials/${group.id}/plan#settle-up`}
                  className="min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white press-feedback hover:bg-accent-strong"
                >
                  Open expenses
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {upcomingTrips.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <h2 className="font-heading font-semibold">Upcoming group trips</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {upcomingTrips.map((g) => (
              <li key={g.id}>
                <Link href={`/socials/${g.id}`} className="font-medium hover:text-accent">{g.name}</Link>
                <span className="text-foreground-muted"> · {g.bookings[0].status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <Link href="/socials" className="text-sm text-foreground-muted underline underline-offset-2">Back to My Socials</Link>
      </div>
    </div>
  );
}
