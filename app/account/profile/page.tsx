import { requireUser } from "@/lib/auth/session";
import { getUserBadges } from "@/lib/gamification/get-user-badges";
import LogoutButtons from "@/app/components/account/LogoutButtons";
import BadgesPanel from "@/app/components/account/BadgesPanel";
import RevealOnScroll from "@/app/components/motion/RevealOnScroll";

export default async function ProfilePage() {
  const user = await requireUser();
  const { badges, tripsCompleted } = await getUserBadges(user.id);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Profile</h1>
      <RevealOnScroll as="div" className="mt-4 max-w-md space-y-2 rounded-xl border border-border bg-surface p-4 text-sm">
        <p><strong>Name:</strong> {user.name ?? "—"}</p>
        {user.phone && <p><strong>Mobile:</strong> {user.phone}</p>}
        {user.email && <p><strong>Email:</strong> {user.email}</p>}
      </RevealOnScroll>
      <BadgesPanel badges={badges} tripsCompleted={tripsCompleted} />
      <LogoutButtons />
    </div>
  );
}
