import { prisma } from "@/lib/db/client";
import TripCostCalculator from "@/app/components/pricing/TripCostCalculator";
import TourPicker from "@/app/components/TourPicker";
import Link from "next/link";

export default async function TripCostCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ tourSlug?: string }>;
}) {
  const sp = await searchParams;
  const tours = await prisma.tour.findMany({
    where: sp.tourSlug ? { slug: sp.tourSlug } : undefined,
    include: { departures: true },
    orderBy: { title: "asc" },
  });
  const selectedSlug = sp.tourSlug ?? tours[0]?.slug;
  const selectedTour = tours.find((t) => t.slug === selectedSlug) ?? tours[0];

  if (!selectedTour) {
    return <p>No tours available yet.</p>;
  }

  const futureDepartures = selectedTour.departures
    .filter((d) => d.startDate >= new Date())
    .map((d) => ({ id: d.id, startDate: d.startDate.toISOString(), seatsLeft: d.totalSeats - d.seatsBooked }));

  const allTours = await prisma.tour.findMany({ select: { slug: true, title: true }, orderBy: { title: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Trip Expense Calculator</h1>
      <p className="mt-2 max-w-2xl text-foreground-muted">
        See your whole trip cost — door to door — before you talk to anyone. Pick a tour below, and every figure
        updates instantly as you change travellers, city and add-ons.
      </p>

      <TourPicker tours={allTours} selectedSlug={selectedSlug!} />

      <div className="mt-6">
        {futureDepartures.length > 0 ? (
          <TripCostCalculator tourId={selectedTour.id} isInternational={selectedTour.isInternational} departures={futureDepartures} />
        ) : (
          <p className="text-sm text-foreground-muted">No upcoming departures for this tour.</p>
        )}
      </div>

      <p className="mt-6 text-sm">
        <Link href={`/tours/${selectedTour.slug}`} className="underline">View the full tour details →</Link>
      </p>

      <p className="mt-8 rounded-md border border-border bg-surface p-3 text-xs text-foreground-muted">
        GST and TCS rates, EMI interest, insurance pricing and spending presets are all set in admin with
        effective-from dates, and feed this calculator, the tour page and checkout identically.
      </p>
    </div>
  );
}
