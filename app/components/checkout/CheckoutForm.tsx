"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoginModal from "../auth/LoginModal";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS, MEAL_PLAN_TYPES } from "@/lib/pricing/constants";

interface TravellerForm {
  name: string;
  age: number;
  mealChoice: "VEG" | "JAIN" | "NON_VEG";
}

export default function CheckoutForm({
  departureId,
  isInternational,
  defaultCity,
  defaultAdults,
}: {
  departureId: string;
  isInternational: boolean;
  defaultCity: string;
  defaultAdults: number;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [city, setCity] = useState(defaultCity);
  const [travellers, setTravellers] = useState<TravellerForm[]>(
    Array.from({ length: Math.max(1, defaultAdults) }, () => ({ name: "", age: 30, mealChoice: "VEG" as const }))
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateTraveller(i: number, field: keyof TravellerForm, value: string | number) {
    setTravellers((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  }

  function addTraveller() {
    setTravellers((prev) => [...prev, { name: "", age: 30, mealChoice: "VEG" }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setShowLogin(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departureId,
        departureCity: city,
        travellers: {
          adults: travellers.length,
          childrenWithBed: 0,
          childrenWithoutBed: 0,
          infants: 0,
          rooms: Math.max(1, Math.ceil(travellers.length / 2)),
          singleOccupancyRooms: travellers.length % 2 === 1 ? 1 : 0,
        },
        travellerDetails: travellers,
        addOns: {},
        spendPreset: "COMFORT",
        amountDuePercentNow: 25,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Could not create booking.");
      return;
    }
    router.push(`/checkout/${data.bookingId}`);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      {error && <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <label className="block text-sm font-medium">
        Departure city
        <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full max-w-xs rounded-md border border-border bg-background px-3 py-2">
          {DEPARTURE_CITIES.map((c) => (
            <option key={c} value={c}>{DEPARTURE_CITY_LABELS[c]}</option>
          ))}
        </select>
      </label>

      <div>
        <h2 className="font-semibold">Travellers</h2>
        <div className="mt-2 space-y-3">
          {travellers.map((t, i) => (
            <fieldset key={i} className="grid grid-cols-1 gap-3 rounded-md border border-border p-3 sm:grid-cols-4">
              <legend className="px-1 text-sm font-medium">Traveller {i + 1}</legend>
              <label className="text-sm">
                Name (as on ID)
                <input required value={t.name} onChange={(e) => updateTraveller(i, "name", e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
              </label>
              <label className="text-sm">
                Age
                <input type="number" required min={0} value={t.age} onChange={(e) => updateTraveller(i, "age", Number(e.target.value))} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
              </label>
              <label className="text-sm">
                Meal choice
                <select value={t.mealChoice} onChange={(e) => updateTraveller(i, "mealChoice", e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5">
                  {MEAL_PLAN_TYPES.map((m) => (
                    <option key={m} value={m}>{m.replace(/_/g, "-")}</option>
                  ))}
                </select>
              </label>
              {isInternational && (
                <label className="text-sm">
                  Passport number
                  <input className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
                </label>
              )}
            </fieldset>
          ))}
        </div>
        <button type="button" onClick={addTraveller} className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm">
          + Add another traveller
        </button>
      </div>

      <button type="submit" disabled={submitting} className="rounded-md bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-strong disabled:opacity-60">
        {submitting ? "Holding your seats…" : "Continue to review & payment"}
      </button>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </form>
  );
}
