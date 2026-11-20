import { getCurrentUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import { prisma } from "@/lib/db/client";
import InviteWidget from "@/app/components/socials/InviteWidget";
import MembersList from "@/app/components/socials/MembersList";

export default async function GroupMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await requireMembership(id, user!.id);
  if (!ctx) return null;

  const members = await prisma.groupMember.findMany({ where: { groupId: id }, orderBy: { createdAt: "asc" } });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <MembersList groupId={id} members={members} isOrganiser={ctx.membership.role === "ORGANISER"} currentMemberId={ctx.membership.id} />
      {ctx.membership.role === "ORGANISER" && <InviteWidget groupId={id} />}
    </div>
  );
}
