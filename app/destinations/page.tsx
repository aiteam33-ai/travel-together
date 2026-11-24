import Link from "next/link";
import Image from "next/image";
import { Globe2 } from "lucide-react";
import { getDestinationsByContinent } from "@/lib/data/tours";
import { formatRupees } from "@/lib/pricing/format";

export const metadata = { title: "Explore the world | Parikrama Holidays" };

const CONTINENT_ORDER = ["Asia", "Europe", "Other"];

export default async function DestinationsPage() {
  const byContinent = await getDestinationsByContinent();
  const continents = Object.keys(byContinent).sort(
    (a, b) => CONTINENT_ORDER.indexOf(a) - CONTINENT_ORDER.indexOf(b)
  );

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-soft via-surface to-surface p-6 md:p-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white">
          <Globe2 size={22} aria-hidden="true" />
        </span>
        <h1 className="font-heading mt-3 text-3xl font-extrabold md:text-4xl">Explore the world</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          Beyond India — beaches, mountains, islands and cities abroad, with the same full-cost pricing, visa and
          TCS details shown up front as every domestic tour.
        </p>
      </section>

      {continents.length === 0 ? (
        <p className="text-foreground-muted">No international tours published yet.</p>
      ) : (
        continents.map((continent) => (
          <section key={continent}>
            <h2 className="font-heading mb-4 text-2xl font-bold">{continent}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {byContinent[continent].map((dest) => (
                <Link
                  key={dest.country}
                  href={`/tours?category=INTERNATIONAL&country=${encodeURIComponent(dest.country)}`}
                  className="card-hover group overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={dest.heroImage}
                      alt={dest.country}
                      fill
                      className="card-hover-image object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
                    <p className="absolute bottom-3 left-4 font-heading text-lg font-bold text-white drop-shadow">{dest.country}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 text-sm">
                    <span className="text-foreground-muted">{dest.tourCount} {dest.tourCount === 1 ? "tour" : "tours"}</span>
                    {dest.cheapestPricePerPerson && (
                      <span className="font-semibold">From {formatRupees(dest.cheapestPricePerPerson)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      <section className="rounded-xl border border-border bg-surface p-5 text-sm text-foreground-muted">
        Every international tour includes visa assistance notes and TCS (Tax Collected at Source) on the price panel
        and at checkout — the same full-cost-before-you-call approach as our domestic tours.
      </section>
    </div>
  );
}
