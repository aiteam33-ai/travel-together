import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import SupportForm from "@/app/components/account/SupportForm";

export default async function SupportPage() {
  const user = await requireUser();
  const requests = await prisma.supportRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Support requests</h1>
      <SupportForm />
      <ul className="mt-6 space-y-2">
        {requests.map((r) => (
          <li key={r.id} className="rounded-lg border border-border bg-surface p-3">
            <p className="font-semibold">{r.subject}</p>
            <p className="text-sm text-foreground-muted">{r.message} — Status: {r.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
