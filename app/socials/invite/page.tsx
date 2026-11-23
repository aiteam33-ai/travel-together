import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSocialsDashboardData } from "@/lib/socials/dashboard-data";
import CreateGroupForm from "@/app/components/socials/CreateGroupForm";

export const metadata = {
  title: "Invite your group | My Socials",
};

// A real, standalone page (not a scrolled-to section of /socials) — this is
// step 1 of My Socials, reachable at its own URL so it never reads as "that
// just took me back to the dashboard/home page."
export default async function InviteYourGroupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/?login=1&next=/socials/invite");

  const { groups, friends, incomingRequests, unreadDMs } = await getSocialsDashboardData(user.id);

  return (
    <div className="max-w-3xl">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-accent">My Socials · Step 1</p>
      <h1 className="font-heading mt-2 text-2xl font-bold">Invite your group</h1>
      <p className="mt-1 text-sm text-foreground-muted">Create a trip group and bring your people in by link or mobile number.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/socials/friends" className="rounded-xl border border-border bg-surface p-4 card-hover">
          <h3 className="font-semibold">My Friends</h3>
          <p className="mt-1 text-sm text-foreground-muted">{friends.length} friend{friends.length === 1 ? "" : "s"} · add more here</p>
          {incomingRequests > 0 && (
            <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
              {incomingRequests} pending request{incomingRequests === 1 ? "" : "s"}
            </span>
          )}
        </Link>
        <Link href="/socials/messages" className="rounded-xl border border-border bg-surface p-4 card-hover">
          <h3 className="font-semibold">Messages</h3>
          <p className="mt-1 text-sm text-foreground-muted">1:1 chats with friends</p>
          {unreadDMs > 0 && (
            <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
              {unreadDMs} unread
            </span>
          )}
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading font-semibold">Start a new trip group</h2>
        <p className="mt-1 text-sm text-foreground-muted">Give it a name — you&apos;ll land straight on its invite link next.</p>
        <div className="mt-3">
          <CreateGroupForm />
        </div>
      </div>

      {groups.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="font-heading font-semibold">Invite people to an existing group</h2>
          {groups.map((group) => (
            <div key={group.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
              <div>
                <p className="font-semibold">{group.name}</p>
                <p className="text-sm text-foreground-muted">{group.members.filter((m) => m.status === "JOINED").length} joined</p>
              </div>
              <Link
                href={`/socials/${group.id}/members`}
                className="min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white press-feedback hover:bg-accent-strong"
              >
                Get invite link
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/socials/plan" className="font-semibold text-accent underline underline-offset-2">Next: Plan and calculate together →</Link>
        <Link href="/socials" className="text-foreground-muted underline underline-offset-2">Back to My Socials</Link>
      </div>
    </div>
  );
}
