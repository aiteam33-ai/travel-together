"use client";

import { useCallback, useEffect, useState } from "react";
import { formatRupees, formatDateIST } from "@/lib/pricing/format";

interface Share {
  id: string;
  memberId: string;
  amountPaise: number;
  status: "PENDING" | "PAID" | "COVERED";
  member: { name: string };
}

interface BookingData {
  id: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  holdExpiresAt: string | null;
  balanceDueDate: string | null;
}

function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [target]);
  if (!target) return null;
  const diffMs = new Date(target).getTime() - now;
  if (diffMs <= 0) return "Expired";
  const totalSeconds = Math.floor(diffMs / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GroupPaymentsPanel({
  bookingId,
  currentMemberId,
  isOrganiser,
  initialData,
}: {
  bookingId: string;
  currentMemberId: string;
  isOrganiser: boolean;
  initialData?: { booking: BookingData; shares: Share[] };
}) {
  const [booking, setBooking] = useState<BookingData | null>(initialData?.booking ?? null);
  const [shares, setShares] = useState<Share[]>(initialData?.shares ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetch(`/api/bookings/${bookingId}/shares`)
      .then((r) => r.json())
      .then((data) => {
        setBooking(data.booking ?? null);
        setShares(data.shares ?? []);
        setLoading(false);
      });
  }, [bookingId]);

  useEffect(() => {
    if (!initialData) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const holdCountdown = useCountdown(booking?.status === "HELD" ? booking.holdExpiresAt : null);

  async function payMyShare(shareId: string) {
    setBusyId(shareId);
    await fetch(`/api/bookings/${bookingId}/shares/${shareId}/pay`, { method: "POST" });
    setBusyId(null);
    refresh();
  }

  async function nudge(shareId: string) {
    setBusyId(shareId);
    await fetch(`/api/bookings/${bookingId}/shares/${shareId}/nudge`, { method: "POST" });
    setBusyId(null);
  }

  async function coverRest() {
    setBusyId("cover-rest");
    await fetch(`/api/bookings/${bookingId}/shares/cover-rest`, { method: "POST" });
    setBusyId(null);
    refresh();
  }

  if (loading || !booking) return <div className="skeleton h-40 rounded-xl" />;

  const pendingCount = shares.filter((s) => s.status === "PENDING").length;

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Group payments</h2>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">{booking.status.replace("_", " ")}</span>
      </div>

      {holdCountdown && (
        <p className={`mt-2 text-sm font-semibold ${holdCountdown === "Expired" ? "text-danger" : "text-accent"}`}>
          Seats held — {holdCountdown === "Expired" ? "hold expired" : `${holdCountdown} left to complete payment`}
        </p>
      )}

      <div className="mt-3 text-sm">
        <p>Total: {formatRupees(booking.amountDue)} · Paid so far: {formatRupees(booking.amountPaid)}</p>
        {booking.balanceDueDate && <p className="text-foreground-muted">Balance due {formatDateIST(booking.balanceDueDate)}</p>}
      </div>

      <ul className="mt-4 space-y-2">
        {shares.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-2 text-sm">
            <div>
              <p className="font-medium">{s.member.name}</p>
              <p className="text-xs text-foreground-muted">{formatRupees(s.amountPaise)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  s.status === "PENDING" ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                }`}
              >
                {s.status === "PENDING" ? "Pending" : s.status === "PAID" ? "Paid" : "Covered"}
              </span>
              {s.status === "PENDING" && s.memberId === currentMemberId && (
                <button
                  onClick={() => payMyShare(s.id)}
                  disabled={busyId === s.id}
                  className="min-h-9 rounded-md bg-accent px-2 text-xs font-semibold text-white press-feedback disabled:opacity-60"
                >
                  Pay my share (UPI, mock)
                </button>
              )}
              {s.status === "PENDING" && s.memberId !== currentMemberId && (
                <button
                  onClick={() => nudge(s.id)}
                  disabled={busyId === s.id}
                  className="min-h-9 rounded-md border border-border px-2 text-xs font-semibold press-feedback disabled:opacity-60"
                >
                  Nudge
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {isOrganiser && pendingCount > 0 && (
        <button
          onClick={coverRest}
          disabled={busyId === "cover-rest"}
          className="mt-3 min-h-11 w-full rounded-md border border-accent px-3 text-sm font-semibold text-accent press-feedback disabled:opacity-60"
        >
          {busyId === "cover-rest" ? "Covering…" : `Cover the remaining ${pendingCount} share${pendingCount === 1 ? "" : "s"}`}
        </button>
      )}
    </section>
  );
}
