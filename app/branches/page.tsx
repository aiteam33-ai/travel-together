import { prisma } from "@/lib/db/client";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany();
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Our branches</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {branches.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-surface p-4">
            <p className="font-semibold">{b.city}</p>
            <p className="mt-1 text-sm text-foreground-muted">{b.address}</p>
            <p className="mt-1 text-sm">{b.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
