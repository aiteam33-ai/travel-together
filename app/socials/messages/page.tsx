import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import MessagesClient from "@/app/components/socials/MessagesClient";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/?login=1&next=/socials/messages");
  const { with: withId } = await searchParams;

  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-2xl font-bold">Messages</h1>
      <p className="mt-1 text-sm text-foreground-muted">1:1 chats with your friends.</p>
      <div className="mt-6">
        <MessagesClient meId={user.id} initialWith={withId} />
      </div>
    </div>
  );
}
