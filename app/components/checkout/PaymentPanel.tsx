"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupees } from "@/lib/pricing/format";
import SeatHoldBar from "./SeatHoldBar";

export default function PaymentPanel({
  bookingId,
  amountDue,
  amountPaid,
  status,
  holdExpiresAt,
}: {
  bookingId: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  holdExpiresAt: string | null;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"UPI" | "CARD" | "NETBANKING" | "EMI">("UPI");
  const [payFull, setPayFull] = useState(false);
  const [simulate, setSimulate] = useState<"RANDOM" | "SUCCESS" | "FAILED" | "PENDING">("SUCCESS");
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [reholding, setReholding] = useState(false);
  const [currentHoldExpiresAt, setCurrentHoldExpiresAt] = useState(holdExpiresAt);

  async function reholdSeats() {
    setReholding(true);
    const res = await fetch(`/api/bookings/${bookingId}/rehold`, { method: "POST" });
    const data = await res.json();
    setReholding(false);
    if (res.ok) {
      setCurrentHoldExpiresAt(data.holdExpiresAt);
      setExpired(false);
    }
  }

  const remainingDue = amountDue - amountPaid;
  const amountToPay = payFull ? remainingDue : Math.round(amountDue * 0.25) - amountPaid > 0 ? Math.round(amountDue * 0.25) - amountPaid : remainingDue;

  async function pay() {
    setPaying(true);
    const res = await fetch(`/api/bookings/${bookingId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, amount: amountToPay, simulate }),
    });
    const data = await res.json();
    setPaying(false);
    if (!res.ok) {
      setResult(data.error ?? "Payment failed.");
      return;
    }
    setResult(data.result);
    if (data.result === "SUCCESS") {
      router.push(`/checkout/${bookingId}/confirmation`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
      {currentHoldExpiresAt && status === "HELD" && (
        <SeatHoldBar holdExpiresAt={currentHoldExpiresAt} onExpired={() => setExpired(true)} />
      )}

      {expired && (
        <div className="rounded-md bg-danger-soft p-3 text-sm">
          <p className="font-semibold text-danger">Your seat hold expired before payment completed.</p>
          <p className="mt-1 text-foreground-muted">Everything you entered is still here — hold your seats again to continue.</p>
          <button
            type="button"
            onClick={reholdSeats}
            disabled={reholding}
            className="mt-2 min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60"
          >
            {reholding ? "Holding seats…" : "Hold seats again"}
          </button>
        </div>
      )}

      <div>
        <p className="font-semibold">Amount due: {formatRupees(amountDue)}</p>
        {amountPaid > 0 && <p className="text-sm text-foreground-muted">Already paid: {formatRupees(amountPaid)}</p>}
      </div>

      <fieldset className="space-y-1 text-sm">
        <legend className="font-medium">Pay</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="payAmount" checked={!payFull} onChange={() => setPayFull(false)} />
          Booking amount ({formatRupees(amountToPay)})
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="payAmount" checked={payFull} onChange={() => setPayFull(true)} />
          Full amount ({formatRupees(remainingDue)})
        </label>
      </fieldset>

      <fieldset className="space-y-1 text-sm">
        <legend className="font-medium">Payment method</legend>
        {(["UPI", "CARD", "NETBANKING", "EMI"] as const).map((m) => (
          <label key={m} className="flex items-center gap-2">
            <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} />
            {m}
          </label>
        ))}
      </fieldset>

      <label className="block text-sm font-medium">
        Mock gateway outcome (demo only)
        <select value={simulate} onChange={(e) => setSimulate(e.target.value as any)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5">
          <option value="SUCCESS">Simulate success</option>
          <option value="FAILED">Simulate failure</option>
          <option value="PENDING">Simulate pending</option>
          <option value="RANDOM">Random</option>
        </select>
      </label>

      <button
        type="button"
        onClick={pay}
        disabled={paying || expired}
        className="w-full rounded-md bg-accent py-2.5 font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
      >
        {paying ? "Processing…" : `Pay ${formatRupees(amountToPay)}`}
      </button>

      {result && result !== "SUCCESS" && (
        <p role="alert" className="text-sm text-danger">
          {result === "FAILED" ? "Payment failed. Please try again." : result === "PENDING" ? "Payment is pending confirmation." : result}
        </p>
      )}
    </div>
  );
}
