import Link from "next/link";
import { listToursForListing } from "@/lib/data/tours";
import TourCard from "../components/TourCard";
import SortSelect from "../components/SortSelect";
import { TOUR_CATEGORIES, TRAVELLER_TAGS, MEAL_PLAN_TYPES } from "@/lib/pricing/constants";

interface SearchParams {
  destination?: string;
  category?: string;
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

function buildHref(sp: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...sp, ...overrides };
  const params = new URLSearchParams();
  Object.entries(merged).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  return `/tours?${params.toString()}`;
}

export default async function ToursPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const results = await listToursForListing({
    destination: sp.destination,
    category: sp.category,
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      <aside aria-label="Filters" className="space-y-6">
        <div>
          <h2 className="mb-2 font-semibold">Category</h2>
          <ul className="space-y-1 text-sm">
            <li><Link className={!sp.category ? "font-bold text-accent" : ""} href={buildHref(sp, { category: undefined })}>All</Link></li>
            {TOUR_CATEGORIES.map((c) => (
              <li key={c}>
                <Link className={sp.category === c ? "font-bold text-accent" : ""} href={buildHref(sp, { category: c })}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 font-semibold">Traveller type</h2>
          <ul className="space-y-1 text-sm">
            {TRAVELLER_TAGS.map((tag) => (
              <li key={tag}>
                <Link className={sp.tag === tag ? "font-bold text-accent" : ""} href={buildHref(sp, { tag })}>
                  {tag.replace(/_/g, " ")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 font-semibold">Meal plan</h2>
          <ul className="space-y-1 text-sm">
            {MEAL_PLAN_TYPES.map((m) => (
              <li key={m}>
                <Link className={sp.mealPlan === m ? "font-bold text-accent" : ""} href={buildHref(sp, { mealPlan: m })}>
                  {m.replace(/_/g, "-")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <form action="/tours" method="get" className="space-y-2">
          <h2 className="font-semibold">Budget (₹ per person)</h2>
          <input name="minBudget" defaultValue={sp.minBudget} placeholder="Min" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
          <input name="maxBudget" defaultValue={sp.maxBudget} placeholder="Max" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
          <h2 className="font-semibold">Duration (days)</h2>
          <input name="durationMin" defaultValue={sp.durationMin} placeholder="Min" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
          <input name="durationMax" defaultValue={sp.durationMax} placeholder="Max" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
          <button type="submit" className="w-full rounded-md bg-accent py-1.5 text-sm font-semibold text-white">Apply</button>
        </form>
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">{results.length} tours found</h1>
          <SortSelect />
        </div>

        {results.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="font-semibold">No tours matched your filters.</p>
            <p className="mt-2 text-sm text-foreground-muted">Try a wider budget, a nearby month, or a different destination.</p>
            <Link href="/tours" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white">Clear filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map(({ tour, futureDepartures, cheapestPricePerPerson }) => (
              <TourCard
                key={tour.id}
                slug={tour.slug}
                title={tour.title}
                heroImage={tour.heroImage}
                durationDays={tour.durationDays}
                durationNights={tour.durationNights}
                cheapestPricePerPerson={cheapestPricePerPerson}
                nextDates={futureDepartures.slice(0, 3).map((d) => d.startDate)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
