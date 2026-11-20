"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PriceBreakdown from "./PriceBreakdown";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS, TRAVEL_MODES, SPEND_PRESETS } from "@/lib/pricing/constants";
import { formatDateIST } from "@/lib/pricing/format";
import type { PricingEngineOutput } from "@/lib/pricing/types";

interface DepartureOption {
  id: string;
  startDate: string;
  seatsLeft: number;
}

export default function TripCostCalculator({
  tourId,
  isInternational,
  departures,
  compact = false,
}: {
  tourId: string;
  isInternational: boolean;
  departures: DepartureOption[];
  compact?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [departureId, setDepartureId] = useState(searchParams.get("departureId") ?? departures[0]?.id ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "MUMBAI");
  const [adults, setAdults] = useState(Number(searchParams.get("adults") ?? 2));
  const [childrenWithBed, setChildrenWithBed] = useState(Number(searchParams.get("cwb") ?? 0));
  const [childrenWithoutBed, setChildrenWithoutBed] = useState(Number(searchParams.get("cnb") ?? 0));
  const [infants, setInfants] = useState(Number(searchParams.get("infants") ?? 0));
  const [rooms, setRooms] = useState(Number(searchParams.get("rooms") ?? 1));
  const [singleRooms, setSingleRooms] = useState(Number(searchParams.get("singleRooms") ?? 0));
  const [joiningMode, setJoiningMode] = useState(searchParams.get("mode") ?? "FLIGHT");
  const [travelInsurance, setTravelInsurance] = useState(searchParams.get("insurance") === "1");
  const [visaFees, setVisaFees] = useState(searchParams.get("visa") === "1");
  const [spendPreset, setSpendPreset] = useState<"BUDGET" | "COMFORT" | "PREMIUM">((searchParams.get("spend") as any) ?? "COMFORT");
  const [couponCode, setCouponCode] = useState(searchParams.get("coupon") ?? "");
  const [amountDuePercentNow, setAmountDuePercentNow] = useState(Number(searchParams.get("dueNow") ?? 25));

  const [output, setOutput] = useState<PricingEngineOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const joiningAtDestination = city === "JOIN_AT_DESTINATION";

  useEffect(() => {
    if (!departureId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-change pattern
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    fetch("/api/pricing/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        departureId,
        departureCity: city,
        travellers: { adults, childrenWithBed, childrenWithoutBed, infants, rooms, singleOccupancyRooms: singleRooms },
        joiningMode: joiningAtDestination ? joiningMode : undefined,
        addOns: { travelInsurance, visaFees },
        spendPreset,
        couponCode: couponCode || undefined,
        amountDuePercentNow,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.formErrors?.[0] ?? "Could not calculate pricing.");
        setOutput(data.output);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setLoading(false));

    const params = new URLSearchParams();
    params.set("departureId", departureId);
    params.set("city", city);
    params.set("adults", String(adults));
    params.set("cwb", String(childrenWithBed));
    params.set("cnb", String(childrenWithoutBed));
    params.set("infants", String(infants));
    params.set("rooms", String(rooms));
    params.set("singleRooms", String(singleRooms));
    if (joiningAtDestination) params.set("mode", joiningMode);
    if (travelInsurance) params.set("insurance", "1");
    if (visaFees) params.set("visa", "1");
    params.set("spend", spendPreset);
    if (couponCode) params.set("coupon", couponCode);
    params.set("dueNow", String(amountDuePercentNow));
    router.replace(`?${params.toString()}`, { scroll: false });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureId, city, adults, childrenWithBed, childrenWithoutBed, infants, rooms, singleRooms, joiningMode, travelInsurance, visaFees, spendPreset, couponCode, amountDuePercentNow]);

  async function saveCalculation() {
    const res = await fetch("/api/calculations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId, departureId, input: { city, adults, childrenWithBed, childrenWithoutBed, infants, rooms, singleRooms }, output }),
    });
    if (res.status === 401) {
      setSaveMsg("Please log in to save this calculation.");
      return;
    }
    const data = await res.json();
    setSaveMsg(data.ok ? "Saved to your account." : "Could not save.");
  }

  function shareOnWhatsApp() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(`https://wa.me/?text=${encodeURIComponent(`Here's my trip cost calculation: ${url}`)}`, "_blank");
  }

  async function downloadPdf() {
    const res = await fetch("/api/pricing/calculate/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tourId,
        departureId,
        departureCity: city,
        travellers: { adults, childrenWithBed, childrenWithoutBed, infants, rooms, singleOccupancyRooms: singleRooms },
        joiningMode: joiningAtDestination ? joiningMode : undefined,
        addOns: { travelInsurance, visaFees },
        spendPreset,
        couponCode: couponCode || undefined,
        amountDuePercentNow,
      }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trip-cost-${tourId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={compact ? "space-y-4" : "grid grid-cols-1 gap-8 lg:grid-cols-2"}>
      <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <label className="block text-sm font-medium">
          Departure date
          <select value={departureId} onChange={(e) => setDepartureId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2">
            {departures.map((d) => (
              <option key={d.id} value={d.id}>{formatDateIST(d.startDate)} ({d.seatsLeft} seats left)</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Departure city
          <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2">
            {DEPARTURE_CITIES.map((c) => (
              <option key={c} value={c}>{DEPARTURE_CITY_LABELS[c]}</option>
            ))}
          </select>
        </label>

        {joiningAtDestination && (
          <label className="block text-sm font-medium">
            How will you get there?
            <select value={joiningMode} onChange={(e) => setJoiningMode(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2">
              {TRAVEL_MODES.map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
              ))}
            </select>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Adults" value={adults} min={1} onChange={setAdults} />
          <NumberField label="Children (with bed)" value={childrenWithBed} min={0} onChange={setChildrenWithBed} />
          <NumberField label="Children (no bed)" value={childrenWithoutBed} min={0} onChange={setChildrenWithoutBed} />
          <NumberField label="Infants" value={infants} min={0} onChange={setInfants} />
          <NumberField label="Rooms" value={rooms} min={1} onChange={setRooms} />
          <NumberField label="Single-occupancy rooms" value={singleRooms} min={0} onChange={setSingleRooms} />
        </div>

        <fieldset className="space-y-1 text-sm">
          <legend className="font-medium">Add-ons</legend>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={travelInsurance} onChange={(e) => setTravelInsurance(e.target.checked)} />
            Travel insurance
          </label>
          {isInternational && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={visaFees} onChange={(e) => setVisaFees(e.target.checked)} />
              Visa fees
            </label>
          )}
        </fieldset>

        <label className="block text-sm font-medium">
          Personal spending style
          <select value={spendPreset} onChange={(e) => setSpendPreset(e.target.value as any)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2">
            {SPEND_PRESETS.map((p) => (
              <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Coupon code
          <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="EARLYBIRD10" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" />
        </label>

        <label className="block text-sm font-medium">
          Pay now
          <select value={amountDuePercentNow} onChange={(e) => setAmountDuePercentNow(Number(e.target.value))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2">
            <option value={25}>Booking amount (25%)</option>
            <option value={100}>Full amount (100%)</option>
          </select>
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" onClick={saveCalculation} className="rounded-md border border-border px-3 py-1.5 text-sm">Save to account</button>
          <button type="button" onClick={shareOnWhatsApp} className="rounded-md border border-border px-3 py-1.5 text-sm">Share on WhatsApp</button>
          <button type="button" onClick={downloadPdf} className="rounded-md border border-border px-3 py-1.5 text-sm">
            Download as PDF
          </button>
        </div>
        {saveMsg && <p className="text-sm text-foreground-muted" role="status">{saveMsg}</p>}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        {loading && <p className="text-sm text-foreground-muted">Calculating…</p>}
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {output && !loading && <PriceBreakdown output={output} />}
        {!loading && !output && !error && <p className="text-sm text-foreground-muted">Choose a departure to see your trip cost.</p>}
      </div>
    </div>
  );
}

function NumberField({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
