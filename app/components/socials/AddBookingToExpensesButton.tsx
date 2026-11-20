"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddBookingToExpensesButton({ groupId, bookingId }: { groupId: string; bookingId: string }) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/groups/${groupId}/expenses/from-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not add to group expenses.");
      return;
    }
    setAdded(true);
  }

  if (added) {
    return (
      <button type="button" onClick={() => router.push(`/socials/${groupId}/expenses`)} className="min-h-11 rounded-md border border-accent px-4 text-sm font-semibold text-accent">
        Added — review in group expenses
      </button>
    );
  }

  return (
    <div>
      <button type="button" onClick={add} disabled={busy} className="min-h-11 rounded-md border border-accent px-4 text-sm font-semibold text-accent press-feedback disabled:opacity-60">
        {busy ? "Adding…" : "Add this booking to group expenses"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
