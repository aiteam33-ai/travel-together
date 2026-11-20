"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import LoginModal from "../auth/LoginModal";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS, MEAL_PLAN_TYPES } from "@/lib/pricing/constants";
import CheckoutStepper, { CHECKOUT_STEPS, CheckoutStep } from "./CheckoutStepper";

interface TravellerForm {
  name: string;
  age: number;
  mealChoice: "VEG" | "JAIN" | "NON_VEG";
  saveForLater: boolean;
}

interface SavedTraveller {
  id: string;
  name: string;
  age: number;
  mealChoice: string;
}

interface PersistedState {
  stepIndex: number;
  city: string;
  travellers: TravellerForm[];
  rooms: number;
  singleRooms: number;
  travelInsurance: boolean;
  visaFees: boolean;
}

function storageKey(departureId: string) {
  return `checkoutDraft:${departureId}`;
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
  const [stepIndex, setStepIndex] = useState(0);
  const [city, setCity] = useState(defaultCity);
  const [travellers, setTravellers] = useState<TravellerForm[]>(
    Array.from({ length: Math.max(1, defaultAdults) }, () => ({ name: "", age: 30, mealChoice: "VEG" as const, saveForLater: false }))
  );
  const [rooms, setRooms] = useState(Math.max(1, Math.ceil(defaultAdults / 2)));
  const [singleRooms, setSingleRooms] = useState(0);
  const [travelInsurance, setTravelInsurance] = useState(false);
  const [visaFees, setVisaFees] = useState(false);
  const [savedTravellers, setSavedTravellers] = useState<SavedTraveller[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState(false);

  // Refreshing mid-checkout keeps the inputs and the step.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(departureId));
      if (raw) {
        const saved: PersistedState = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of a draft on mount
        setStepIndex(saved.stepIndex);
        setCity(saved.city);
        setTravellers(saved.travellers);
        setRooms(saved.rooms);
        setSingleRooms(saved.singleRooms);
        setTravelInsurance(saved.travelInsurance);
        setVisaFees(saved.visaFees);
      }
    } catch {}
    setRestored(true);
  }, [departureId]);

  useEffect(() => {
    if (!restored) return;
    const state: PersistedState = { stepIndex, city, travellers, rooms, singleRooms, travelInsurance, visaFees };
    try {
      sessionStorage.setItem(storageKey(departureId), JSON.stringify(state));
    } catch {}
  }, [restored, departureId, stepIndex, city, travellers, rooms, singleRooms, travelInsurance, visaFees]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/saved-travellers")
      .then((r) => r.json())
      .then((data) => setSavedTravellers(data.travellers ?? []));
  }, [user]);

  function updateTraveller(i: number, field: keyof TravellerForm, value: string | number | boolean) {
    setTravellers((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  }

  function applySavedTraveller(i: number, savedId: string) {
    const saved = savedTravellers.find((s) => s.id === savedId);
    if (!saved) return;
    setTravellers((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, name: saved.name, age: saved.age, mealChoice: saved.mealChoice as TravellerForm["mealChoice"] } : t))
    );
  }

  function addTraveller() {
    setTravellers((prev) => [...prev, { name: "", age: 30, mealChoice: "VEG", saveForLater: false }]);
  }

  const currentStep = CHECKOUT_STEPS[stepIndex];
  const travellersValid = travellers.every((t) => t.name.trim().length > 0);

  function goNext() {
    setStepIndex((i) => Math.min(CHECKOUT_STEPS.length - 2, i + 1)); // stop before "Pay", which lives on the next page
  }
  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
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
          rooms,
          singleOccupancyRooms: singleRooms,
        },
        travellerDetails: travellers,
        addOns: { travelInsurance, visaFees },
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
    await Promise.all(
      travellers
        .filter((t) => t.saveForLater)
        .map((t) =>
          fetch("/api/saved-travellers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: t.name, age: t.age, mealChoice: t.mealChoice }),
          })
        )
    );
    try {
      sessionStorage.removeItem(storageKey(departureId));
    } catch {}
    router.push(`/checkout/${data.bookingId}`);
  }

  return (
    <div className="mt-6">
      <CheckoutStepper currentStep={currentStep} onStepClick={(step) => setStepIndex(CHECKOUT_STEPS.indexOf(step))} />

      <form onSubmit={submit} className="space-y-6">
        {error && <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        {currentStep === "Travellers" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Departure city
              <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 min-h-11 w-full max-w-xs rounded-md border border-border bg-background px-3">
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
                    {savedTravellers.length > 0 && (
                      <label className="text-sm sm:col-span-4">
                        Fill from a saved traveller
                        <select defaultValue="" onChange={(e) => e.target.value && applySavedTraveller(i, e.target.value)} className="mt-1 min-h-11 w-full max-w-xs rounded-md border border-border bg-background px-2">
                          <option value="">— Choose —</option>
                          {savedTravellers.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} (Age {s.age})</option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label className="text-sm">
                      Name (as on ID)
                      <input required value={t.name} onChange={(e) => updateTraveller(i, "name", e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
                    </label>
                    <label className="text-sm">
                      Age
                      <input type="number" required min={0} value={t.age} onChange={(e) => updateTraveller(i, "age", Number(e.target.value))} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
                    </label>
                    <label className="text-sm">
                      Meal choice
                      <select value={t.mealChoice} onChange={(e) => updateTraveller(i, "mealChoice", e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2">
                        {MEAL_PLAN_TYPES.map((m) => (
                          <option key={m} value={m}>{m.replace(/_/g, "-")}</option>
                        ))}
                      </select>
                    </label>
                    {isInternational && (
                      <label className="text-sm">
                        Passport number
                        <input className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
                      </label>
                    )}
                    <label className="flex items-center gap-2 text-sm sm:col-span-4">
                      <input type="checkbox" checked={t.saveForLater} onChange={(e) => updateTraveller(i, "saveForLater", e.target.checked)} />
                      Save this traveller to my account for next time
                    </label>
                  </fieldset>
                ))}
              </div>
              <button type="button" onClick={addTraveller} className="mt-2 min-h-11 rounded-md border border-border px-3 text-sm press-feedback">
                + Add another traveller
              </button>
            </div>
          </div>
        )}

        {currentStep === "Rooms" && (
          <div className="max-w-sm space-y-4">
            <h2 className="font-semibold">Rooms</h2>
            <label className="block text-sm font-medium">
              Number of rooms
              <input type="number" min={1} value={rooms} onChange={(e) => setRooms(Math.max(1, Number(e.target.value) || 1))} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
            </label>
            <label className="block text-sm font-medium">
              Single-occupancy rooms (supplement applies)
              <input type="number" min={0} max={rooms} value={singleRooms} onChange={(e) => setSingleRooms(Math.max(0, Number(e.target.value) || 0))} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
            </label>
          </div>
        )}

        {currentStep === "Add-ons" && (
          <fieldset className="max-w-sm space-y-2">
            <legend className="font-semibold">Add-ons</legend>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={travelInsurance} onChange={(e) => setTravelInsurance(e.target.checked)} />
              Travel insurance
            </label>
            {isInternational && (
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={visaFees} onChange={(e) => setVisaFees(e.target.checked)} />
                Visa fees
              </label>
            )}
          </fieldset>
        )}

        {currentStep === "Review" && (
          <div className="max-w-xl space-y-4">
            <h2 className="font-semibold">Review</h2>
            <div className="rounded-md border border-border p-3 text-sm">
              <p><strong>Departure city:</strong> {DEPARTURE_CITY_LABELS[city as keyof typeof DEPARTURE_CITY_LABELS]}</p>
              <p className="mt-1"><strong>Travellers:</strong></p>
              <ul className="ml-4 list-disc">
                {travellers.map((t, i) => (
                  <li key={i}>{t.name || `Traveller ${i + 1} (name pending)`} · Age {t.age} · {t.mealChoice.replace(/_/g, "-")}</li>
                ))}
              </ul>
              <p className="mt-1"><strong>Rooms:</strong> {rooms} ({singleRooms} single-occupancy)</p>
              <p className="mt-1"><strong>Add-ons:</strong> {[travelInsurance && "Travel insurance", visaFees && "Visa fees"].filter(Boolean).join(", ") || "None"}</p>
            </div>
            <p className="text-sm text-foreground-muted">The exact cost breakdown and payment come next, with your seats held for 15 minutes.</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {stepIndex > 0 && (
            <button type="button" onClick={goBack} className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold press-feedback">
              Back
            </button>
          )}
          {currentStep !== "Review" ? (
            <button
              type="button"
              onClick={goNext}
              disabled={currentStep === "Travellers" && !travellersValid}
              className="min-h-11 rounded-md bg-accent px-5 text-sm font-semibold text-white press-feedback hover:bg-accent-strong disabled:opacity-60"
            >
              Continue
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="min-h-11 rounded-md bg-accent px-5 font-semibold text-white press-feedback hover:bg-accent-strong disabled:opacity-60">
              {submitting ? "Holding your seats…" : "Continue to payment"}
            </button>
          )}
        </div>
      </form>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
