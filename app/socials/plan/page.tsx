import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSocialsDashboardData } from "@/lib/socials/dashboard-data";

export const metadata = {
  title: "Plan and calculate together | My Socials",
};

// Step 2 of My Socials, its own standalone page. Each group listed here
// links into that group's real Plan & Expenses page
// (app/socials/[id]/plan/page.tsx) where the shortlist/vote and the full
// expense calculator actually live.
export default async function PlanAndCalculatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/?login=1&next=/socials/plan");

  const { groups } = await getSocialsDashboardData(user.id);

  return (
    <div className="max-w-3xl">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-accent">My Socials · Step 2</p>
      <h1 className="font-heading mt-2 text-2xl font-bold">Plan and calculate together</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Shortlist tours, chat, vote, and see each group&apos;s live cost estimate — then log and split expenses in the
        same place.
      </p>

      {groups.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold">No groups yet</p>
          <p className="mt-1 text-sm text-foreground-muted">
            <Link href="/socials/invite" className="text-accent underline underline-offset-2">Create a group</Link> to start planning.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
              <div>
                <p className="font-semibold">{group.name}</p>
                <p className="text-sm text-foreground-muted">
                  {group.tour ? group.tour.title : "No tour shortlisted yet"} · {group.shortlist.length} shortlisted · {group.members.filter((m) => m.status === "JOINED").length} joined
                </p>
              </div>
              <Link
                href={`/socials/${group.id}/plan`}
                className="min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white press-feedback hover:bg-accent-strong"
              >
                Open planning
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/socials/book-split" className="font-semibold text-accent underline underline-offset-2">Next: Book and split expenses →</Link>
        <Link href="/socials" className="text-foreground-muted underline underline-offset-2">Back to My Socials</Link>
      </div>
    </div>
  );
}
