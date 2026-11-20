import { prisma } from "@/lib/db/client";
import { formatDateIST } from "@/lib/pricing/format";

export default async function AdminAuditLogPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const admins = await prisma.user.findMany({ where: { id: { in: logs.map((l) => l.adminUserId) } } });
  const adminName = (id: string) => admins.find((a) => a.id === id)?.name ?? admins.find((a) => a.id === id)?.phone ?? id;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Audit log</h1>
      <p className="text-sm text-foreground-muted">Every price and tax change, who made it, and the old and new value.</p>
      <table className="mt-4 w-full text-sm">
        <thead><tr className="text-left"><th>When</th><th>Admin</th><th>Entity</th><th>Key</th><th>Old value</th><th>New value</th></tr></thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t border-border">
              <td className="py-1">{formatDateIST(l.createdAt)}</td>
              <td>{adminName(l.adminUserId)}</td>
              <td>{l.entity}</td>
              <td>{l.key}</td>
              <td>{l.oldValue ?? "—"}</td>
              <td className="font-semibold">{l.newValue}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan={6} className="py-4 text-center text-foreground-muted">No changes recorded yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
