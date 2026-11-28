import { requireUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import VibeCheckTab from "@/app/components/socials/VibeCheckTab";

export default async function GroupVibeCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return null;

  return (
    <div>
      <p className="mb-4 text-sm text-foreground-muted">
        Share your travel style and a private budget only you can see — the group only sees a shared comfort range.
      </p>
      <VibeCheckTab groupId={id} />
    </div>
  );
}
