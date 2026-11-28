import Link from "next/link";
import { CalendarDays, Gauge, Compass, Sun, Clock, MapPinned } from "lucide-react";
import type { TrekCategoryFacets } from "@/lib/data/tours";
import { MONTH_LABELS, SEASON_LABELS } from "@/lib/trek/seasons";
import { INDIA_REGION_LABELS, type IndiaRegion } from "@/lib/pricing/constants";

function buildHref(params: Record<string, string | number>) {
  const sp = new URLSearchParams({ category: "TREK", ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  return `/tours?${sp.toString()}`;
}

function Column({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-surface p-5">
      <h3 className="font-heading border-b-2 border-accent pb-2 text-base font-bold">{title}</h3>
      <ul className="relative z-10 mt-3 flex flex-col gap-1.5 text-sm">{children}</ul>
      <Icon className="absolute -bottom-4 -right-4 text-accent-soft" size={110} strokeWidth={1} aria-hidden="true" />
    </div>
  );
}

function CategoryLink({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <li>
      <Link href={href} className="text-foreground-muted hover:text-accent hover:underline">
        {label} <span className="text-xs">({count})</span>
      </Link>
    </li>
  );
}

/**
 * Real, data-driven browse facets for TREK tours — every bucket here comes
 * from getTrekCategoryFacets() and only appears once an actual trek backs
 * it, so this never shows a category with nothing behind it.
 */
export default function TreksByCategories({ facets }: { facets: TrekCategoryFacets }) {
  const hasAny =
    facets.months.length > 0 ||
    facets.difficulties.length > 0 ||
    facets.experienceTags.length > 0 ||
    facets.seasons.length > 0 ||
    facets.durationBuckets.length > 0 ||
    facets.regions.length > 0;

  if (!hasAny) return null;

  return (
    <section className="mb-8">
      <h2 className="font-heading mb-4 text-2xl font-bold">Treks by Categories</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {facets.months.length > 0 && (
          <Column icon={CalendarDays} title="Treks by Month">
            {facets.months.map(({ month, count }) => (
              <CategoryLink key={month} href={buildHref({ month })} label={MONTH_LABELS[month - 1]} count={count} />
            ))}
          </Column>
        )}

        {facets.difficulties.length > 0 && (
          <Column icon={Gauge} title="Treks by Difficulty">
            {facets.difficulties.map(({ difficulty, count }) => (
              <CategoryLink key={difficulty} href={buildHref({ difficulty })} label={difficulty} count={count} />
            ))}
          </Column>
        )}

        {facets.experienceTags.length > 0 && (
          <Column icon={Compass} title="Treks by Experience">
            {facets.experienceTags.map(({ tag, count }) => (
              <CategoryLink key={tag} href={buildHref({ tag })} label={tag.replace(/_/g, " ")} count={count} />
            ))}
          </Column>
        )}

        {facets.seasons.length > 0 && (
          <Column icon={Sun} title="Treks by Season">
            {facets.seasons.map(({ season, count }) => (
              <CategoryLink key={season} href={buildHref({ season })} label={SEASON_LABELS[season]} count={count} />
            ))}
          </Column>
        )}

        {facets.durationBuckets.length > 0 && (
          <Column icon={Clock} title="Treks by Duration">
            {facets.durationBuckets.map((b) => (
              <CategoryLink
                key={b.label}
                href={buildHref(b.max !== undefined ? { durationMin: b.min, durationMax: b.max } : { durationMin: b.min })}
                label={b.label}
                count={b.count}
              />
            ))}
          </Column>
        )}

        {facets.regions.length > 0 && (
          <Column icon={MapPinned} title="Treks by Region">
            {facets.regions.map(({ region, count }) => (
              <CategoryLink key={region} href={buildHref({ region })} label={INDIA_REGION_LABELS[region as IndiaRegion] ?? region} count={count} />
            ))}
          </Column>
        )}
      </div>
    </section>
  );
}
