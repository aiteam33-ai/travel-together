import { requireUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import { formatRupees } from "@/lib/pricing/format";
import GroupFeed from "@/app/components/socials/GroupFeed";
import InviteWidget from "@/app/components/socials/InviteWidget";
import GroupPaymentsPanel from "@/app/components/socials/GroupPaymentsPanel";
import ReadinessPanel from "@/app/components/socials/ReadinessPanel";
import TrekEssentialsPanel from "@/app/components/socials/TrekEssentialsPanel";
import SafetyCenterPanel from "@/app/components/socials/SafetyCenterPanel";
import { deriveBestSeason } from "@/lib/trek/essentials";
import {
  getReadinessData,
  getFeedData,
  getChecklistData,
  getFitnessRating,
  getSafetyData,
  getSosData,
  getSharesData,
} from "@/lib/groups/panel-data";
import Link from "next/link";

// These panels' props mirror exactly what their own API routes return over
// JSON (same shape, same union-typed enum fields) — so normalizing the
// server-fetched data through a JSON round-trip here (Dates -> ISO strings)
// makes it identical to what the client fetch would have produced, and the
// component prop types below can stay unchanged.
function asJson<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export default async function GroupOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return null;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { tour: true, members: true, bookings: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!group) return null;

  const joinedMembers = group.members.filter((m) => m.status === "JOINED");
  const estimate = group.estimateSnapshotJson ? JSON.parse(group.estimateSnapshotJson) : null;
  const booking = group.bookings[0];
  const isTrekOrPilgrimage = group.tour?.category === "TREK" || group.tour?.category === "PILGRIMAGE";

  // Every panel below used to fetch its own data client-side after mount —
  // up to 8 separate round trips firing only once the shell had already
  // painted. Fetching them all here, in parallel, means each panel renders
  // with real data on first paint instead of a skeleton.
  const [readiness, feed, checklist, fitness, safety, sos, shares] = await Promise.all([
    group.tour ? getReadinessData(id, ctx) : null,
    getFeedData(id),
    isTrekOrPilgrimage ? getChecklistData(id, ctx) : null,
    isTrekOrPilgrimage ? getFitnessRating(ctx) : null,
    getSafetyData(id, ctx),
    getSosData(id),
    booking ? getSharesData(booking.id, ctx) : null,
  ]);

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

        {booking && shares && (
          <GroupPaymentsPanel bookingId={booking.id} currentMemberId={ctx.membership.id} isOrganiser={ctx.membership.role === "ORGANISER"} initialData={asJson(shares)} />
        )}

        {group.tour && readiness && <ReadinessPanel groupId={id} initialData={asJson(readiness)} />}

        {isTrekOrPilgrimage && checklist && (
          <TrekEssentialsPanel
            groupId={id}
            bestSeason={deriveBestSeason(group.tour!)}
            difficulty={group.tour!.difficulty}
            initialChecklist={asJson(checklist)}
            initialFitness={fitness}
          />
        )}

        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-2 font-semibold">Activity</h2>
          <GroupFeed groupId={id} currentMemberId={ctx.membership.id} initialData={asJson(feed)} />
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
        <SafetyCenterPanel groupId={id} isOrganiser={ctx.membership.role === "ORGANISER"} initialSafety={asJson(safety)} initialSos={asJson(sos)} />
      </aside>
    </div>
  );
}
