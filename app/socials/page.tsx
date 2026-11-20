import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import CreateGroupForm from "@/app/components/socials/CreateGroupForm";
import MarkSocialsSeen from "@/app/components/socials/MarkSocialsSeen";

export default async function SocialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, status: "JOINED" },
    include: { group: { include: { tour: true, members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl">
      <MarkSocialsSeen />
      <h1 className="font-heading text-2xl font-bold">My Socials</h1>
      <p className="mt-1 text-sm text-foreground-muted">Plan trips with your people — invite, chat, split costs, book together.</p>

      <div className="mt-6">
        <CreateGroupForm />
      </div>

      <div className="mt-8">
        {memberships.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-semibold">No groups yet</p>
            <p className="mt-1 text-sm text-foreground-muted">
              Create a group above, or ask a friend to send you an invite link.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memberships.map(({ group }) => (
              <Link key={group.id} href={`/socials/${group.id}`} className="block rounded-xl border border-border bg-surface p-4 hover:border-accent">
                <p className="font-semibold">{group.name}</p>
                <p className="text-sm text-foreground-muted">
                  {group.tour ? group.tour.title : "No tour selected yet"} · {group.members.filter((m) => m.status === "JOINED").length} joined
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
