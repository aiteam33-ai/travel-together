import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { getFriendIds } from "@/lib/friends/access";
import CreateGroupForm from "@/app/components/socials/CreateGroupForm";
import MarkSocialsSeen from "@/app/components/socials/MarkSocialsSeen";

export default async function SocialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/?login=1&next=/socials");

  const [memberships, friendIds, incomingRequests, unreadDMs] = await Promise.all([
    prisma.groupMember.findMany({
      where: { userId: user.id, status: "JOINED" },
      include: { group: { include: { tour: true, members: true, bookings: { orderBy: { createdAt: "desc" }, take: 1 } } } },
      orderBy: { createdAt: "desc" },
    }),
    getFriendIds(user.id),
    prisma.friendRequest.count({ where: { toUserId: user.id, status: "PENDING" } }),
    prisma.directMessage.count({ where: { toUserId: user.id, readAt: null } }),
  ]);

  const friends = friendIds.length
    ? await prisma.user.findMany({ where: { id: { in: friendIds } }, select: { id: true, name: true } })
    : [];

  const groups = memberships.map((m) => m.group);
  const upcomingTrips = groups.filter((g) => g.bookings[0] && g.bookings[0].status !== "CANCELLED");

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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/socials/friends" className="rounded-xl border border-border bg-surface p-4 card-hover">
          <h2 className="font-semibold">My Friends</h2>
          <p className="mt-1 text-sm text-foreground-muted">{friends.length} friend{friends.length === 1 ? "" : "s"}</p>
          {incomingRequests > 0 && (
            <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
              {incomingRequests} pending request{incomingRequests === 1 ? "" : "s"}
            </span>
          )}
        </Link>

        <Link href="/socials/messages" className="rounded-xl border border-border bg-surface p-4 card-hover">
          <h2 className="font-semibold">Messages</h2>
          <p className="mt-1 text-sm text-foreground-muted">1:1 chats with friends</p>
          {unreadDMs > 0 && (
            <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
              {unreadDMs} unread
            </span>
          )}
        </Link>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">My Groups</h2>
          <p className="mt-1 text-sm text-foreground-muted">{groups.length} group{groups.length === 1 ? "" : "s"}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Split Expenses</h2>
          <p className="mt-1 text-sm text-foreground-muted">Open any group&apos;s Expenses tab to add costs and see who owes whom.</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Trip Budget Calculator</h2>
          <p className="mt-1 text-sm text-foreground-muted">Open a group&apos;s Budget tab to plan costs per category.</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 sm:col-span-2">
          <h2 className="font-semibold">Group Discussions</h2>
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

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Upcoming Group Trips</h2>
          {upcomingTrips.length === 0 ? (
            <p className="mt-1 text-sm text-foreground-muted">No booked trips yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {upcomingTrips.map((g) => (
                <li key={g.id}>
                  <Link href={`/socials/${g.id}`} className="font-medium hover:text-accent">{g.name}</Link>
                  <span className="text-foreground-muted"> · {g.bookings[0].status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-heading text-lg font-semibold">Start a new trip group</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Create a group, invite friends, discuss destinations, calculate the budget, and split expenses — all together.
        </p>
        <div className="mt-4">
          <CreateGroupForm />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Your groups</h2>
        {groups.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-semibold">No groups yet</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Create a group above, or ask a friend to send you an invite link.
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
