import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import InviteJoinClient from "@/app/components/socials/InviteJoinClient";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await prisma.groupInviteLink.findUnique({ where: { token }, include: { group: true } });
  if (!link) notFound();

  const expired = link.revoked || link.expiresAt < new Date();

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-surface p-6 text-center">
      {expired ? (
        <>
          <h1 className="font-heading text-xl font-bold">This invite link has expired</h1>
          <p className="mt-2 text-sm text-foreground-muted">Ask the organiser of &ldquo;{link.group.name}&rdquo; for a new link.</p>
        </>
      ) : (
        <InviteJoinClient token={token} groupName={link.group.name} />
      )}
    </div>
  );
}
