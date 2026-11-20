import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { requireMembership } from "@/lib/groups/access";
import GroupTabs from "@/app/components/socials/GroupTabs";

export default async function GroupLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const ctx = await requireMembership(id, user.id);
  if (!ctx) notFound();

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="font-heading text-2xl font-bold">{ctx.group.name}</h1>
        <p className="text-sm text-foreground-muted">You are {ctx.membership.role === "ORGANISER" ? "the organiser" : "a member"}</p>
      </div>
      <GroupTabs groupId={id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
