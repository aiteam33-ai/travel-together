"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PriceBreakdown from "./pricing/PriceBreakdown";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS } from "@/lib/pricing/constants";
import type { PricingEngineOutput } from "@/lib/pricing/types";

interface CompareTour {
  id: string;
  slug: string;
  title: string;
  heroImage: string;
  durationDays: number;
  isInternational: boolean;
  nextDepartureId: string | null;
}

export default function CompareClient() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") ?? "";

  const [tours, setTours] = useState<CompareTour[]>([]);
  const [city, setCity] = useState("MUMBAI");
  const [adults, setAdults] = useState(2);
  const [outputs, setOutputs] = useState<Record<string, PricingEngineOutput | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids) return;
    fetch(`/api/compare?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => setTours(data.tours))
      .finally(() => setLoading(false));
  }, [ids]);

  useEffect(() => {
    tours.forEach((t) => {
      if (!t.nextDepartureId) return;
      fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureId: t.nextDepartureId,
          departureCity: city,
          travellers: { adults, childrenWithBed: 0, childrenWithoutBed: 0, infants: 0, rooms: Math.max(1, Math.ceil(adults / 2)), singleOccupancyRooms: 0 },
          addOns: {},
          spendPreset: "COMFORT",
          amountDuePercentNow: 25,
        }),
      })
        .then((r) => r.json())
        .then((data) => setOutputs((prev) => ({ ...prev, [t.id]: data.output ?? null })));
    });
  }, [tours, city, adults]);

  if (loading) return <p className="mt-4 text-sm text-foreground-muted">Loading…</p>;
  if (tours.length === 0) return <p className="mt-4 text-sm text-foreground-muted">No tours selected. Go back and tick &ldquo;Compare&rdquo; on up to three tours.</p>;

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-border bg-surface p-4">
        <label className="text-sm font-medium">
          Departure city
          <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block rounded-md border border-border bg-background px-2 py-1.5">
            {DEPARTURE_CITIES.map((c) => (
              <option key={c} value={c}>{DEPARTURE_CITY_LABELS[c]}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Adults
          <input type="number" min={1} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))} className="mt-1 block w-24 rounded-md border border-border bg-background px-2 py-1.5" />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {tours.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
            <Link href={`/tours/${t.slug}`} className="font-semibold hover:text-accent">{t.title}</Link>
            <p className="text-sm text-foreground-muted">{t.durationDays} days</p>
            {t.nextDepartureId ? (
              outputs[t.id] ? (
                <div className="mt-3">
                  <PriceBreakdown output={outputs[t.id]!} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-foreground-muted">Calculating…</p>
              )
            ) : (
              <p className="mt-3 text-sm text-foreground-muted">No upcoming departures.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
