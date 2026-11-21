import { getCurrentUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import { formatRupees } from "@/lib/pricing/format";
import GroupFeed from "@/app/components/socials/GroupFeed";
import InviteWidget from "@/app/components/socials/InviteWidget";
import GroupPaymentsPanel from "@/app/components/socials/GroupPaymentsPanel";
import ReadinessPanel from "@/app/components/socials/ReadinessPanel";
import TrekEssentialsPanel from "@/app/components/socials/TrekEssentialsPanel";
import { deriveBestSeason } from "@/lib/trek/essentials";
import Link from "next/link";

export default async function GroupOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await requireMembership(id, user!.id);
  if (!ctx) return null;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { tour: true, members: true, bookings: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!group) return null;

  const joinedMembers = group.members.filter((m) => m.status === "JOINED");
  const estimate = group.estimateSnapshotJson ? JSON.parse(group.estimateSnapshotJson) : null;
  const booking = group.bookings[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Trip</h2>
          {group.tour ? (
            <p className="mt-1 text-sm">
              <Link href={`/tours/${group.tour.slug}`} className="font-semibold text-accent hover:underline">{group.tour.title}</Link>
            </p>
          ) : (
            <p className="mt-1 text-sm text-foreground-muted">No tour selected yet — add some to the Plan tab.</p>
          )}
          {estimate && (
            <p className="mt-2 text-sm">
              Group estimate: <strong>{formatRupees(estimate.grandTotal)}</strong> ({formatRupees(estimate.costPerPerson)} per person) — an estimate from the pricing engine.
            </p>
          )}
          {group.tour && (
            <Link href={`/socials/${id}/estimate`} className="mt-2 inline-block min-h-11 text-sm font-medium text-accent underline">
              {estimate ? "Update the group estimate" : "Calculate group cost"}
            </Link>
          )}
          {!booking && group.tour && ctx.membership.role === "ORGANISER" && (
            <Link
              href={`/tours/${group.tour.slug}?groupId=${id}`}
              className="mt-2 inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback"
            >
              Book for this group
            </Link>
          )}
          {!booking && <p className="mt-2 text-sm text-foreground-muted">Not booked yet.</p>}
        </section>

        {booking && <GroupPaymentsPanel bookingId={booking.id} currentMemberId={ctx.membership.id} isOrganiser={ctx.membership.role === "ORGANISER"} />}

        {group.tour && <ReadinessPanel groupId={id} />}

        {group.tour && (group.tour.category === "TREK" || group.tour.category === "PILGRIMAGE") && (
          <TrekEssentialsPanel groupId={id} bestSeason={deriveBestSeason(group.tour)} difficulty={group.tour.difficulty} />
        )}

        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-2 font-semibold">Activity</h2>
          <GroupFeed groupId={id} currentMemberId={ctx.membership.id} />
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-2 font-semibold">Who&apos;s joined ({joinedMembers.length})</h2>
          <ul className="space-y-1 text-sm">
            {joinedMembers.map((m) => (
              <li key={m.id}>{m.name} {m.role === "ORGANISER" && <span className="text-xs text-foreground-muted">(organiser)</span>}</li>
            ))}
          </ul>
        </section>
        {ctx.membership.role === "ORGANISER" && <InviteWidget groupId={id} />}
      </aside>
    </div>
  );
}
