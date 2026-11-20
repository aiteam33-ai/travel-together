"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS } from "@/lib/pricing/constants";

export default function SearchBar() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [city, setCity] = useState("MUMBAI");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (duration) params.set("durationMax", duration);
    if (budget) params.set("maxBudget", budget);
    if (city) params.set("city", city);
    router.push(`/tours?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-xl bg-surface p-4 shadow-md" aria-label="Search tours">
      <label className="flex flex-col text-sm font-medium">
        Destination
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Kerala, Bali"
          className="mt-1 w-44 rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col text-sm font-medium">
        Duration up to (days)
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="mt-1 w-32 rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col text-sm font-medium">
        Budget up to (₹)
        <input
          type="number"
          min={0}
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="50000"
          className="mt-1 w-32 rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col text-sm font-medium">
        Departure city
        <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-40 rounded-md border border-border bg-background px-3 py-2">
          {DEPARTURE_CITIES.map((c) => (
            <option key={c} value={c}>{DEPARTURE_CITY_LABELS[c]}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="rounded-md bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-strong">
        Search tours
      </button>
    </form>
  );
}
