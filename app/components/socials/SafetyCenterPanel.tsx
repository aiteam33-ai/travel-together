"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateIST } from "@/lib/pricing/format";

interface Contact {
  memberId: string;
  name: string;
  isOrganiser: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  medicalNotes?: string | null; // present only for own record, or organiser+consent
  medicalNotesConsent: boolean;
}

interface SosAlert {
  id: string;
  message: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  resolvedAt: string | null;
  member: { name: string };
}

export default function SafetyCenterPanel({ groupId, isOrganiser }: { groupId: string; isOrganiser: boolean }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [tripLeader, setTripLeader] = useState<{ name: string; phone: string | null } | null>(null);
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sosBusy, setSosBusy] = useState(false);

  const refresh = useCallback(() => {
    fetch(`/api/groups/${groupId}/safety`)
      .then((r) => r.json())
      .then((data) => {
        setContacts(data.contacts ?? []);
        setMyMemberId(data.myMemberId ?? null);
        setTripLeader(data.tripLeader ?? null);
        const mine = (data.contacts ?? []).find((c: Contact) => c.memberId === data.myMemberId);
        if (mine) {
          setName(mine.emergencyContactName ?? "");
          setPhone(mine.emergencyContactPhone ?? "");
          setMedicalNotes(mine.medicalNotes ?? "");
          setConsent(mine.medicalNotesConsent ?? false);
        }
        setLoading(false);
      });
    fetch(`/api/groups/${groupId}/sos`)
      .then((r) => r.json())
      .then((data) => setAlerts(data.alerts ?? []));
  }, [groupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/groups/${groupId}/safety`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emergencyContactName: name, emergencyContactPhone: phone, medicalNotes, medicalNotesConsent: consent }),
    });
    setSaving(false);
    refresh();
  }

  function sendSos() {
    setSosBusy(true);
    const post = (lat?: number, lng?: number) =>
      fetch(`/api/groups/${groupId}/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      }).then(() => {
        setSosBusy(false);
        refresh();
      });

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      // Browsers don't reliably start the `timeout` clock until the
      // permission prompt is answered, so a slow/ignored prompt can leave
      // this button stuck well past 5s — this is a safety feature, so a
      // hard client-side fallback guarantees the SOS still sends (without
      // location) no later than ~5s even if geolocation never calls back.
      let settled = false;
      const fallback = setTimeout(() => {
        if (!settled) {
          settled = true;
          post();
        }
      }, 5000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (settled) return;
          settled = true;
          clearTimeout(fallback);
          post(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(fallback);
          post();
        },
        { timeout: 5000 }
      );
    } else {
      post();
    }
  }

  async function resolveAlert(alertId: string) {
    await fetch(`/api/groups/${groupId}/sos/${alertId}/resolve`, { method: "POST" });
    refresh();
  }

  if (loading) return <div className="skeleton h-48 rounded-xl" />;

  const activeAlerts = alerts.filter((a) => !a.resolvedAt);

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Safety Center</h2>
        <button
          onClick={sendSos}
          disabled={sosBusy}
          className="min-h-11 rounded-full bg-danger px-5 text-sm font-bold text-white press-feedback disabled:opacity-60"
        >
          {sosBusy ? "Sending…" : "SOS"}
        </button>
      </div>

      {activeAlerts.length > 0 && (
        <div className="mt-3 space-y-2">
          {activeAlerts.map((a) => (
            <div key={a.id} className="rounded-md border border-danger bg-danger/10 p-3 text-sm">
              <p className="font-semibold text-danger">
                {a.member.name} raised an SOS — {formatDateIST(a.createdAt)}
              </p>
              {a.latitude != null && a.longitude != null && (
                <a
                  href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-accent underline"
                >
                  View shared location
                </a>
              )}
              <button onClick={() => resolveAlert(a.id)} className="mt-2 block min-h-9 rounded-md border border-border px-2 text-xs font-semibold press-feedback">
                Mark resolved
              </button>
            </div>
          ))}
        </div>
      )}

      {tripLeader && (
        <div className="mt-4 rounded-md border border-border bg-background p-3 text-sm">
          <p className="font-medium">Trip leader</p>
          <p>{tripLeader.name}{tripLeader.phone && ` · ${tripLeader.phone}`}</p>
          <p className="mt-1 text-xs text-foreground-muted">24×7 support: +91 98765 43210</p>
        </div>
      )}

      <form onSubmit={save} className="mt-4 space-y-2 border-t border-border pt-3">
        <p className="text-sm font-medium">Your emergency contact</p>
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contact name"
            className="min-h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contact phone"
            className="min-h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>
        <label className="block text-sm font-medium">
          Medical notes — private, shared only with the trip leader if you consent
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Share my medical notes with the trip leader
        </label>
        <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60">
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-sm font-medium">Group emergency contacts</p>
        <ul className="mt-2 space-y-1 text-sm">
          {contacts.map((c) => (
            <li key={c.memberId} className="flex items-center justify-between">
              <span>{c.name}{c.isOrganiser && " (organiser)"}</span>
              <span className="text-xs text-foreground-muted">
                {c.emergencyContactName ? `${c.emergencyContactName} · ${c.emergencyContactPhone ?? "—"}` : "Not set"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isOrganiser && contacts.some((c) => c.medicalNotesConsent && c.memberId !== myMemberId) && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm font-medium">Medical notes shared with you (trip leader)</p>
          <ul className="mt-2 space-y-1 text-sm">
            {contacts
              .filter((c) => c.medicalNotesConsent && c.memberId !== myMemberId && c.medicalNotes)
              .map((c) => (
                <li key={c.memberId}>
                  <strong>{c.name}:</strong> {c.medicalNotes}
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}
