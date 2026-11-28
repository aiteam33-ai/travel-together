import { requireUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import PlanTab from "@/app/components/socials/PlanTab";
import ExpensesTab from "@/app/components/socials/ExpensesTab";

export default async function GroupPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return null;

  const [shortlist, members] = await Promise.all([
    prisma.groupShortlistItem.findMany({
      where: { groupId: id },
      include: { tour: true, addedBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.groupMember.findMany({ where: { groupId: id, status: { not: "LEFT" } }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-heading text-lg font-bold">Shortlist &amp; vote</h2>
        <p className="mt-1 text-sm text-foreground-muted">Add tours you&apos;re considering and vote on them together.</p>
        <div className="mt-4">
          <PlanTab
            groupId={id}
            isOrganiser={ctx.membership.role === "ORGANISER"}
            shortlist={shortlist.map((s) => ({
              id: s.id,
              tourId: s.tourId,
              tourTitle: s.tour.title,
              tourSlug: s.tour.slug,
              addedByName: s.addedBy.name,
              selected: s.selected,
            }))}
          />
        </div>
      </section>

      <section id="settle-up" className="scroll-mt-20 border-t border-border pt-8">
        <h2 className="font-heading text-lg font-bold">Expenses &amp; settle up</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Every member can log what they paid for — hotel, food, transport, tickets, shopping or anything else — who it
          should be split among, and this calculates exactly who owes whom, in the fewest payments possible.
        </p>
        <div className="mt-4">
          <ExpensesTab
            groupId={id}
            members={members.map((m) => ({ id: m.id, name: m.name }))}
            currentMemberId={ctx.membership.id}
            isOrganiser={ctx.membership.role === "ORGANISER"}
          />
        </div>
      </section>
    </div>
  );
}
