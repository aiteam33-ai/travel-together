import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import StaggerReveal from "@/app/components/motion/StaggerReveal";

export default async function SavedTravellersPage() {
  const user = await requireUser();
  const travellers = await prisma.savedTraveller.findMany({ where: { userId: user.id } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Saved travellers</h1>
      {travellers.length === 0 ? (
        <p className="mt-4 text-foreground-muted">No saved travellers yet. They&apos;ll be offered to you automatically next time you book.</p>
      ) : (
        <StaggerReveal as="ul" className="mt-4 space-y-2">
          {travellers.map((t) => (
            <li key={t.id} className="rounded-lg border border-border bg-surface p-3">{t.name} · Age {t.age} · {t.mealChoice}</li>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
