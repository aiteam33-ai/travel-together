import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import TripCostCalculator from "@/app/components/pricing/TripCostCalculator";

export default async function GroupEstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await requireMembership(id, user!.id);
  if (!ctx) return null;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { tour: { include: { departures: true } }, members: true },
  });
  if (!group) return null;

  if (!group.tour) {
    return (
      <div>
        <h1 className="font-heading text-xl font-bold">No tour selected yet</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Shortlist and select a tour on the <Link href={`/socials/${id}/plan`} className="underline">Plan tab</Link> first.
        </p>
      </div>
    );
  }

  const joinedCount = group.members.filter((m) => m.status === "JOINED").length;
  const futureDepartures = group.tour.departures
    .filter((d) => d.startDate >= new Date())
    .map((d) => ({ id: d.id, startDate: d.startDate.toISOString(), seatsLeft: d.totalSeats - d.seatsBooked }));

  return (
    <div>
      <h1 className="font-heading text-xl font-bold">Group cost estimate</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Pre-filled with {joinedCount} joined member{joinedCount === 1 ? "" : "s"}. Save it so everyone in the group sees the same total.
      </p>
      <div className="mt-4">
        <TripCostCalculator
          tourId={group.tour.id}
          isInternational={group.tour.isInternational}
          departures={futureDepartures}
          groupId={id}
          defaultAdults={Math.max(1, joinedCount)}
        />
      </div>
    </div>
  );
}
