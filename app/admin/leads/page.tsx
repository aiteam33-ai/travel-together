import { prisma } from "@/lib/db/client";
import { formatDateIST } from "@/lib/pricing/format";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Leads</h1>
      <table className="mt-4 w-full text-sm">
        <thead><tr className="text-left"><th>Name</th><th>Phone</th><th>Source</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-t border-border">
              <td className="py-1">{l.name}</td>
              <td>{l.phone}</td>
              <td>{l.source}</td>
              <td>{l.status}</td>
              <td>{formatDateIST(l.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
