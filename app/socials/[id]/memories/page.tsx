import { requireUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import MemoriesClient from "@/app/components/socials/MemoriesClient";

interface ItineraryDay {
  day: number;
  title: string;
}

export default async function GroupMemoriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return null;

  const [group, photos, expenseTotal] = await Promise.all([
    prisma.group.findUnique({ where: { id }, include: { tour: true } }),
    prisma.groupFeedItem.findMany({
      where: { groupId: id, messageKind: "IMAGE", deletedAt: null },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.aggregate({ where: { groupId: id, deletedAt: null }, _sum: { amountPaise: true } }),
  ]);
  if (!group) return null;

  const tour = group.tour;
  const itinerary: ItineraryDay[] = tour ? JSON.parse(tour.itinerary) : [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold">Trip memories</h2>
        {tour ? (
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="font-heading text-2xl font-bold text-accent">{tour.durationDays}</p>
              <p className="text-xs text-foreground-muted">days</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-accent">{itinerary.length}</p>
              <p className="text-xs text-foreground-muted">places on the itinerary</p>
            </div>
            {tour.altitudeMeters && (
              <div>
                <p className="font-heading text-2xl font-bold text-accent">{tour.altitudeMeters.toLocaleString("en-IN")}m</p>
                <p className="text-xs text-foreground-muted">peak altitude</p>
              </div>
            )}
            <div>
              <p className="font-heading text-2xl font-bold text-accent">₹{((expenseTotal._sum.amountPaise ?? 0) / 100).toLocaleString("en-IN")}</p>
              <p className="text-xs text-foreground-muted">total group spend</p>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-foreground-muted">No tour was selected for this group.</p>
        )}
      </section>

      {photos.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Shared photo album</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.attachmentUrl ?? ""} alt="Trip memory" className="h-28 w-full rounded-md object-cover" />
            ))}
          </div>
        </section>
      )}

      {itinerary.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Route</h2>
          <ol className="mt-3 space-y-2 border-l border-border pl-4 text-sm">
            {itinerary.map((day) => (
              <li key={day.day} className="relative">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-accent" />
                <span className="font-semibold">Day {day.day}:</span> {day.title}
              </li>
            ))}
          </ol>
        </section>
      )}

      <MemoriesClient groupId={id} hasTour={!!tour} isOrganiser={ctx.membership.role === "ORGANISER"} />
    </div>
  );
}
