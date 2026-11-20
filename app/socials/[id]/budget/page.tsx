import { getCurrentUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import BudgetCalculator from "@/app/components/socials/BudgetCalculator";

export default async function GroupBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await requireMembership(id, user!.id);
  if (!ctx) return null;

  return (
    <div>
      <p className="mb-4 text-sm text-foreground-muted">
        Plan the trip&apos;s budget together — every member sees the same numbers.
      </p>
      <BudgetCalculator groupId={id} />
    </div>
  );
}
