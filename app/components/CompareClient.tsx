"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PriceBreakdown from "./pricing/PriceBreakdown";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS } from "@/lib/pricing/constants";
import { formatDateIST } from "@/lib/pricing/format";
import type { PricingEngineOutput } from "@/lib/pricing/types";

interface CompareTour {
  id: string;
  slug: string;
  title: string;
  heroImage: string;
  durationDays: number;
  durationNights: number;
  difficulty: string | null;
  category: string;
  isInternational: boolean;
  nextDepartureId: string | null;
  nextDepartureDates: string[];
  groupSize: number | null;
  cheapestPricePerPerson: number | null;
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: { daysBefore: number; feePercent: number }[];
}

interface Group {
  id: string;
  name: string;
}

export default function CompareClient() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") ?? "";

  const [tours, setTours] = useState<CompareTour[]>([]);
  const [city, setCity] = useState("MUMBAI");
  const [adults, setAdults] = useState(2);
  const [outputs, setOutputs] = useState<Record<string, PricingEngineOutput | null>>({});
  // Lazily derived from the initial URL: a bare /compare with no ?ids= has
  // nothing to load, so it should never show "Loading…" at all.
  const [loading, setLoading] = useState(() => !!ids);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sharing, setSharing] = useState<string | null>(null);
  const [shared, setShared] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!ids) return;
    fetch(`/api/compare?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => setTours(data.tours))
      .finally(() => setLoading(false));
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => setGroups(data.groups ?? []));
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

  async function shareToGroup(tourId: string, groupId: string) {
    setSharing(tourId);
    const tour = tours.find((t) => t.id === tourId)!;
    await fetch(`/api/groups/${groupId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: tour.title, messageKind: "PACKAGE", attachmentTourId: tourId }),
    });
    setSharing(null);
    setShared((prev) => ({ ...prev, [tourId]: true }));
  }

  if (loading) return <p className="mt-4 text-sm text-foreground-muted">Loading…</p>;
  if (tours.length === 0) return <p className="mt-4 text-sm text-foreground-muted">No tours selected. Go back and tick &ldquo;Compare&rdquo; on up to three tours.</p>;

  const prices = tours.map((t) => t.cheapestPricePerPerson).filter((p): p is number => p != null);
  const bestPrice = prices.length ? Math.min(...prices) : null;
  const bestValueTourId = bestPrice != null ? tours.find((t) => t.cheapestPricePerPerson === bestPrice)?.id : null;

  const allInclusions = Array.from(new Set(tours.flatMap((t) => t.inclusions)));
  const allExclusions = Array.from(new Set(tours.flatMap((t) => t.exclusions)));

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

      {/* Headline cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {tours.map((t) => (
          <div key={t.id} className={`rounded-xl border p-4 ${t.id === bestValueTourId ? "border-accent bg-accent-soft" : "border-border bg-surface"}`}>
            {t.id === bestValueTourId && (
              <span className="mb-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">Best value for your group</span>
            )}
            <Link href={`/tours/${t.slug}`} className="block font-semibold hover:text-accent">{t.title}</Link>
            <p className="text-sm text-foreground-muted">{t.durationDays} days / {t.durationNights} nights</p>
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

            {groups.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => e.target.value && shareToGroup(t.id, e.target.value)}
                  disabled={sharing === t.id}
                  className="min-h-9 rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="" disabled>Share to group chat…</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {shared[t.id] && <span className="text-xs text-success">Shared ✓</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full comparison table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border p-2 text-left font-semibold">Compare</th>
              {tours.map((t) => (
                <th key={t.id} className={`border-b border-border p-2 text-left font-semibold ${t.id === bestValueTourId ? "text-accent" : ""}`}>
                  {t.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-border p-2 font-medium text-foreground-muted">Price per person</td>
              {tours.map((t) => (
                <td key={t.id} className={`border-b border-border p-2 ${t.cheapestPricePerPerson === bestPrice ? "font-bold text-accent" : ""}`}>
                  {t.cheapestPricePerPerson ? `₹${(t.cheapestPricePerPerson / 100).toLocaleString("en-IN")}` : "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-border p-2 font-medium text-foreground-muted">Duration</td>
              {tours.map((t) => (
                <td key={t.id} className="border-b border-border p-2">{t.durationDays} days / {t.durationNights} nights</td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-border p-2 font-medium text-foreground-muted">Difficulty</td>
              {tours.map((t) => (
                <td key={t.id} className="border-b border-border p-2">{t.difficulty ?? "—"}</td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-border p-2 font-medium text-foreground-muted">Group size (next departure)</td>
              {tours.map((t) => (
                <td key={t.id} className="border-b border-border p-2">{t.groupSize ?? "—"}</td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-border p-2 font-medium text-foreground-muted">Upcoming dates</td>
              {tours.map((t) => (
                <td key={t.id} className="border-b border-border p-2">
                  {t.nextDepartureDates.length ? t.nextDepartureDates.map((d) => formatDateIST(d)).join(", ") : "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-border p-2 font-medium text-foreground-muted">Cancellation policy</td>
              {tours.map((t) => (
                <td key={t.id} className="border-b border-border p-2 text-xs">
                  {t.cancellationPolicy.map((c) => `${c.daysBefore}+ days: ${c.feePercent}% fee`).join("; ")}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-border p-2 align-top font-medium text-foreground-muted">Inclusions</td>
              {tours.map((t) => (
                <td key={t.id} className="border-b border-border p-2 align-top">
                  <ul className="space-y-0.5">
                    {allInclusions.map((item) => {
                      const has = t.inclusions.includes(item);
                      const unique = has && tours.filter((o) => o.inclusions.includes(item)).length === 1;
                      if (!has) return null;
                      return (
                        <li key={item} className={unique ? "font-semibold text-accent" : ""}>
                          ✓ {item}
                        </li>
                      );
                    })}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-border p-2 align-top font-medium text-foreground-muted">Exclusions</td>
              {tours.map((t) => (
                <td key={t.id} className="border-b border-border p-2 align-top">
                  <ul className="space-y-0.5 text-foreground-muted">
                    {allExclusions.map((item) => (t.exclusions.includes(item) ? <li key={item}>– {item}</li> : null))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
