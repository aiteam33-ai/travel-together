import { getCurrentUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import ExpensesTab from "@/app/components/socials/ExpensesTab";

export default async function GroupExpensesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await requireMembership(id, user!.id);
  if (!ctx) return null;

  const members = await prisma.groupMember.findMany({ where: { groupId: id, status: { not: "LEFT" } }, orderBy: { createdAt: "asc" } });

  return <ExpensesTab groupId={id} members={members.map((m) => ({ id: m.id, name: m.name }))} currentMemberId={ctx.membership.id} isOrganiser={ctx.membership.role === "ORGANISER"} />;
}
