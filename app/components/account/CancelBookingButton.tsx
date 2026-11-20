"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupees } from "@/lib/pricing/format";

export default function CancelBookingButton({ bookingId, refundAmount }: { bookingId: string; refundAmount: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmCancel() {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="mt-2 rounded-md border border-danger px-3 py-1.5 text-sm text-danger">
        Cancel booking
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-danger/40 bg-danger/5 p-3">
      <p className="text-sm">You will be refunded <strong>{formatRupees(refundAmount)}</strong>. This cannot be undone. Confirm cancellation?</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={confirmCancel} disabled={loading} className="rounded-md bg-danger px-3 py-1.5 text-sm font-semibold text-white">
          {loading ? "Cancelling…" : "Yes, cancel"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="rounded-md border border-border px-3 py-1.5 text-sm">
          Keep booking
        </button>
      </div>
    </div>
  );
}
