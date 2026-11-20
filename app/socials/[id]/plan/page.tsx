import { getCurrentUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import PlanTab from "@/app/components/socials/PlanTab";

export default async function GroupPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await requireMembership(id, user!.id);
  if (!ctx) return null;

  const shortlist = await prisma.groupShortlistItem.findMany({
    where: { groupId: id },
    include: { tour: true, addedBy: true },
    orderBy: { createdAt: "desc" },
  });

  return (
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
  );
}
