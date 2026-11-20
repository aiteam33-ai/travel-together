import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export default async function SavedTravellersPage() {
  const user = await getCurrentUser();
  const travellers = await prisma.savedTraveller.findMany({ where: { userId: user!.id } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Saved travellers</h1>
      {travellers.length === 0 ? (
        <p className="mt-4 text-foreground-muted">No saved travellers yet. They&apos;ll be offered to you automatically next time you book.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {travellers.map((t) => (
            <li key={t.id} className="rounded-lg border border-border bg-surface p-3">{t.name} · Age {t.age} · {t.mealChoice}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
