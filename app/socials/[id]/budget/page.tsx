import { getCurrentUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import BudgetCalculator from "@/app/components/socials/BudgetCalculator";
import SmartBudgetPlanner from "@/app/components/socials/SmartBudgetPlanner";

export default async function GroupBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await requireMembership(id, user!.id);
  if (!ctx) return null;

  const joinedCount = await prisma.groupMember.count({ where: { groupId: id, status: "JOINED" } });

  return (
    <div className="space-y-8">
      <SmartBudgetPlanner groupId={id} defaultTravellers={joinedCount} />

      <div className="border-t border-border pt-8">
        <h2 className="font-heading text-lg font-bold">Manual category budget</h2>
        <p className="mt-1 mb-4 text-sm text-foreground-muted">
          Prefer to set exact numbers per category yourself instead? Do that here — every member sees the same
          numbers.
        </p>
        <BudgetCalculator groupId={id} />
      </div>
    </div>
  );
}
