import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { getSocialsDashboardData } from "@/lib/socials/dashboard-data";
import MarkSocialsSeen from "@/app/components/socials/MarkSocialsSeen";

export default async function SocialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/?login=1&next=/socials");

  const { groups } = await getSocialsDashboardData(user.id);

  const recentFeed = groups.length
    ? await prisma.groupFeedItem.findMany({
        where: { groupId: { in: groups.map((g) => g.id) }, deletedAt: null, type: { not: "SYSTEM" } },
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  return (
    <div className="max-w-5xl">
      <MarkSocialsSeen />
      <h1 className="font-heading text-2xl font-bold">My Socials</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Connect with friends, plan together, and keep expenses straight — all in one place.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { step: "1", title: "Invite your group", body: "Create a group and invite friends by link or mobile number.", href: "/socials/invite" },
          { step: "2", title: "Plan and calculate together", body: "Shortlist tours, chat, vote, and see each group's live cost estimate.", href: "/socials/plan" },
          { step: "3", title: "Book and split expenses", body: "One person books for the group; everyone pays their own share.", href: "/socials/book-split" },
        ].map((item) => (
          <Link key={item.step} href={item.href} className="group block rounded-xl border border-border bg-surface p-5 card-hover press-feedback">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{item.step}</span>
            <h2 className="font-heading mt-3 font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-foreground-muted">{item.body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
              Open <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/socials/friends" className="rounded-xl border border-border bg-surface p-4 card-hover">
          <h2 className="font-semibold">My Friends</h2>
        </Link>
        <Link href="/socials/messages" className="rounded-xl border border-border bg-surface p-4 card-hover">
          <h2 className="font-semibold">Messages</h2>
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-heading text-lg font-semibold">Group Discussions</h2>
        {recentFeed.length === 0 ? (
          <p className="mt-1 text-sm text-foreground-muted">No recent activity yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {recentFeed.map((item) => (
              <li key={item.id} className="truncate text-foreground-muted">
                <span className="font-medium text-foreground">{item.author?.name ?? "Someone"}:</span> {item.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Your groups</h2>
        {groups.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-semibold">No groups yet</p>
            <p className="mt-1 text-sm text-foreground-muted">
              <Link href="/socials/invite" className="text-accent underline underline-offset-2">Create a group</Link>, or ask a friend to send you an invite link.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {groups.map((group) => (
              <Link key={group.id} href={`/socials/${group.id}`} className="block rounded-xl border border-border bg-surface p-4 hover:border-accent">
                <p className="font-semibold">{group.name}</p>
                <p className="text-sm text-foreground-muted">
                  {group.tour ? group.tour.title : "No tour selected yet"} · {group.members.filter((m) => m.status === "JOINED").length} joined
                  {group.bookings[0] && <> · Trip budget & expenses connected</>}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
