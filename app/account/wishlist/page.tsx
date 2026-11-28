import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import StaggerReveal from "@/app/components/motion/StaggerReveal";

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await prisma.wishlistItem.findMany({ where: { userId: user.id }, include: { tour: true } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-foreground-muted">Nothing saved yet. <Link href="/tours" className="underline">Browse tours</Link></p>
      ) : (
        <StaggerReveal as="ul" className="mt-4 space-y-2">
          {items.map((i) => (
            <li key={i.id} className="rounded-lg border border-border bg-surface p-3">
              <Link href={`/tours/${i.tour.slug}`} className="font-semibold hover:text-accent">{i.tour.title}</Link>
            </li>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
