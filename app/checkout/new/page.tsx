import { Suspense } from "react";
import { prisma } from "@/lib/db/client";
import CheckoutForm from "@/app/components/checkout/CheckoutForm";

export default function NewCheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <NewCheckoutInner searchParamsPromise={searchParams} />
    </Suspense>
  );
}

async function NewCheckoutInner({ searchParamsPromise }: { searchParamsPromise: Promise<Record<string, string>> }) {
  const sp = await searchParamsPromise;
  const departureId = sp.departureId;
  if (!departureId) return <p>Missing departure.</p>;

  const departure = await prisma.departure.findUnique({ where: { id: departureId }, include: { tour: true } });
  if (!departure) return <p>Departure not found.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Book: {departure.tour.title}</h1>
      <CheckoutForm
        departureId={departure.id}
        isInternational={departure.tour.isInternational}
        defaultCity={sp.city ?? "MUMBAI"}
        defaultAdults={Number(sp.adults ?? 2)}
      />
    </div>
  );
}
