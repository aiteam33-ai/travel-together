import Link from "next/link";
import { listToursForListing } from "@/lib/data/tours";
import TourCard from "../components/TourCard";
import SortSelect from "../components/SortSelect";
import FilterRail from "../components/listing/FilterRail";
import ResultsGrid from "../components/listing/ResultsGrid";

interface SearchParams {
  destination?: string;
  category?: string;
  region?: string;
  country?: string;
  tag?: string;
  minBudget?: string;
  maxBudget?: string;
  durationMin?: string;
  durationMax?: string;
  mealPlan?: string;
  difficulty?: string;
  sort?: string;
  city?: string;
}

export default async function ToursPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const results = await listToursForListing({
    destination: sp.destination,
    category: sp.category,
    region: sp.region,
    country: sp.country,
    tag: sp.tag,
    minBudget: sp.minBudget ? Number(sp.minBudget) : undefined,
    maxBudget: sp.maxBudget ? Number(sp.maxBudget) : undefined,
    durationMin: sp.durationMin ? Number(sp.durationMin) : undefined,
    durationMax: sp.durationMax ? Number(sp.durationMax) : undefined,
    mealPlan: sp.mealPlan,
    difficulty: sp.difficulty,
    sort: sp.sort,
  });

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
      <FilterRail sp={sp} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">{results.length} {results.length === 1 ? "tour" : "tours"} found</h1>
          <SortSelect />
        </div>

        {results.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="font-semibold">No tours matched your filters.</p>
            <p className="mt-2 text-sm text-foreground-muted">Try a wider budget, a nearby month, or a different destination.</p>
            <Link href="/tours" className="mt-4 inline-block min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white">Clear filters</Link>
          </div>
        ) : (
          <ResultsGrid
            results={results.map(({ tour, futureDepartures, cheapestPricePerPerson }) => ({
              tourId: tour.id,
              slug: tour.slug,
              title: tour.title,
              heroImage: tour.heroImage,
              durationDays: tour.durationDays,
              durationNights: tour.durationNights,
              cheapestPricePerPerson,
              nextDates: futureDepartures.slice(0, 3).map((d) => d.startDate.toISOString()),
            }))}
          />
        )}
      </section>
    </div>
  );
}
