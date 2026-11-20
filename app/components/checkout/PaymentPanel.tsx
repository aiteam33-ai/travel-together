"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupees } from "@/lib/pricing/format";

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
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!holdExpiresAt || status !== "HELD") return;
    function tick() {
      const diff = Math.max(0, Math.floor((new Date(holdExpiresAt!).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [holdExpiresAt, status]);

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

  const expired = secondsLeft === 0 && status === "HELD";

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
      {secondsLeft !== null && status === "HELD" && (
        <p role="timer" className={`rounded-md p-2 text-center text-sm font-semibold ${expired ? "bg-danger/10 text-danger" : "bg-accent/10"}`}>
          {expired ? "Seat hold expired" : `Seats held for ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
        </p>
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
