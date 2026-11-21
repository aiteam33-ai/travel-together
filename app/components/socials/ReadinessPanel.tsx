"use client";

import { useEffect, useState, useCallback } from "react";

interface MemberReadiness {
  memberId: string;
  name: string;
  paymentDone: boolean;
  preferencesFilled: boolean;
  idDocumentUploaded: boolean;
  packingDone: boolean;
}

function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [target]);
  if (!target) return null;
  const diffMs = new Date(target).getTime() - now;
  if (diffMs <= 0) return "Departed";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}

export default function ReadinessPanel({ groupId }: { groupId: string }) {
  const [perMember, setPerMember] = useState<MemberReadiness[]>([]);
  const [readinessPercent, setReadinessPercent] = useState(0);
  const [departureDate, setDepartureDate] = useState<string | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch(`/api/groups/${groupId}/readiness`)
      .then((r) => r.json())
      .then((data) => {
        setPerMember(data.perMember ?? []);
        setReadinessPercent(data.readinessPercent ?? 0);
        setDepartureDate(data.departureDate ?? null);
        setMyMemberId(data.myMemberId ?? null);
        setLoading(false);
      });
  }, [groupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const countdown = useCountdown(departureDate);

  async function toggleMine(field: "idDocumentUploaded" | "packingDone", value: boolean) {
    await fetch(`/api/groups/${groupId}/readiness`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    refresh();
  }

  if (loading) return <div className="skeleton h-40 rounded-xl" />;

  const mine = perMember.find((m) => m.memberId === myMemberId);

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Trip countdown &amp; readiness</h2>
        {countdown && <span className="font-heading text-lg font-bold text-accent">{countdown}</span>}
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-sm">
          <span>Group readiness</span>
          <span className="font-semibold">{readinessPercent}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-background">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${readinessPercent}%` }} />
        </div>
      </div>

      {mine && (
        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <p className="text-sm font-medium">Your checklist</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={mine.idDocumentUploaded} onChange={(e) => toggleMine("idDocumentUploaded", e.target.checked)} />
            ID document uploaded (mock)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={mine.packingDone} onChange={(e) => toggleMine("packingDone", e.target.checked)} />
            Packing done
          </label>
        </div>
      )}

      <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
        <p className="font-medium">Group status</p>
        {perMember.map((m) => (
          <div key={m.memberId} className="flex items-center justify-between">
            <span>{m.name}</span>
            <span className="flex gap-1 text-xs text-foreground-muted">
              <span className={m.paymentDone ? "text-success" : ""}>Pay</span>
              <span className={m.preferencesFilled ? "text-success" : ""}>Vibe</span>
              <span className={m.idDocumentUploaded ? "text-success" : ""}>ID</span>
              <span className={m.packingDone ? "text-success" : ""}>Pack</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
