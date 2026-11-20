import { prisma } from "@/lib/db/client";
import { formatDateIST } from "@/lib/pricing/format";

export default async function AdminOutboxPage() {
  const messages = await prisma.outboxMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Message outbox</h1>
      <p className="text-sm text-foreground-muted">
        Mock email/SMS/WhatsApp messages the app would have sent to a real provider.
      </p>
      <div className="mt-4 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
            <p className="font-semibold">[{m.channel}] to {m.toAddress} {m.subject && `— ${m.subject}`}</p>
            <p className="text-foreground-muted">{m.body}</p>
            <p className="text-xs text-foreground-muted">{formatDateIST(m.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
