import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import FriendsClient from "@/app/components/socials/FriendsClient";

export default async function FriendsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">Friends</h1>
      <p className="mt-1 text-sm text-foreground-muted">Connect with people you travel with.</p>
      <div className="mt-6">
        <FriendsClient />
      </div>
    </div>
  );
}
