"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STAGES = ["BOOKED", "DOCUMENTS_RECEIVED", "BALANCE_PAID", "VOUCHERS_ISSUED", "TRIP_COMPLETED"];

export default function TrackerStageSelect({ bookingId, trackerStage }: { bookingId: string; trackerStage: string }) {
  const router = useRouter();
  const [value, setValue] = useState(trackerStage);
  const [saving, setSaving] = useState(false);

  async function onChange(newValue: string) {
    setValue(newValue);
    setSaving(true);
    await fetch(`/api/admin/bookings/${bookingId}/tracker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackerStage: newValue }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select value={value} disabled={saving} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1 text-xs">
      {STAGES.map((s) => (
        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
      ))}
    </select>
  );
}
