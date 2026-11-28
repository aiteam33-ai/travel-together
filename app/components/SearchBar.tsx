"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS } from "@/lib/pricing/constants";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function SearchBar() {
  const router = useRouter();
  const { t } = useLocale();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [city, setCity] = useState("MUMBAI");

  // Pre-select from the /welcome onboarding choice, if any — read after
  // mount (not in the initializer) so this never runs during SSR, where
  // localStorage doesn't exist.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("parikrama_prefs");
      const savedCity = raw ? JSON.parse(raw)?.city : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a stored preference on mount
      if (typeof savedCity === "string" && savedCity) setCity(savedCity);
    } catch {}
  }, []);

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
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/30 bg-surface/70 p-4 text-foreground shadow-raised backdrop-blur-xl" aria-label="Search tours">
      <label className="flex flex-col text-sm font-medium text-foreground">
        {t("search.destination")}
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Kerala, Bali"
          className="mt-1 w-44 rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted"
        />
      </label>
      <label className="flex flex-col text-sm font-medium text-foreground">
        {t("search.durationUpTo")}
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="mt-1 w-32 rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      </label>
      <label className="flex flex-col text-sm font-medium text-foreground">
        {t("search.budgetUpTo")}
        <input
          type="number"
          min={0}
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="50000"
          className="mt-1 w-32 rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted"
        />
      </label>
      <label className="flex flex-col text-sm font-medium text-foreground">
        {t("search.city")}
        <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-40 rounded-md border border-border bg-background px-3 py-2 text-foreground">
          {DEPARTURE_CITIES.map((c) => (
            <option key={c} value={c}>{DEPARTURE_CITY_LABELS[c]}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="rounded-md bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-strong">
        {t("search.submit")}
      </button>
    </form>
  );
}
