import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { formatDateIST, formatRupees } from "@/lib/pricing/format";

export default async function SavedCalculationsPage() {
  const user = await getCurrentUser();
  const calcs = await prisma.savedCalculation.findMany({ where: { userId: user!.id }, include: { tour: true }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Saved calculations</h1>
      {calcs.length === 0 ? (
        <p className="mt-4 text-foreground-muted">No saved calculations yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {calcs.map((c) => {
            const output = JSON.parse(c.outputJson);
            return (
              <li key={c.id} className="rounded-lg border border-border bg-surface p-3">
                <Link href={`/tours/${c.tour.slug}`} className="font-semibold hover:text-accent">{c.tour.title}</Link>
                <p className="text-sm text-foreground-muted">
                  Saved {formatDateIST(c.createdAt)} · Grand total {output.grandTotal ? formatRupees(output.grandTotal) : "—"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
