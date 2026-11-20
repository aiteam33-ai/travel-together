import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) redirect("/");

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
      <nav aria-label="Admin" className="space-y-1 text-sm">
        <p className="mb-2 font-semibold">Admin</p>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin">Pricing &amp; tax</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin/tours">Tours &amp; departures</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin/bookings">Bookings</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin/leads">Leads</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin/coupons">Coupons</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin/reviews">Review moderation</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin/outbox">Message outbox</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin/audit-log">Audit log</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/admin/analytics">Analytics</Link>
      </nav>
      <div>{children}</div>
    </div>
  );
}
