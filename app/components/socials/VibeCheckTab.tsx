"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatRupees } from "@/lib/pricing/format";
import { INTEREST_CHIPS, FOOD_PREFERENCES, STAY_PREFERENCES, type InterestChip } from "@/lib/pricing/constants";

interface MatchResult {
  label: "Budget Pick" | "Best Match" | "Premium Pick";
  tourId: string;
  slug: string;
  title: string;
  groupScore: number;
  averageScore: number;
  memberScores: { memberId: string; score: number }[];
  budgetWarning: boolean;
  pricePerPerson: number | null;
}

const PACE_LABELS = ["Relaxed", "Easy", "Balanced", "Active", "Packed"];

interface Mine {
  pace: number;
  interests: string;
  foodPreference: string | null;
  stayPreference: string | null;
  secretBudgetPaise: number | null;
}

export default function VibeCheckTab({ groupId }: { groupId: string }) {
  const [mine, setMine] = useState<Mine>({ pace: 3, interests: "", foodPreference: null, stayPreference: null, secretBudgetPaise: null });
  const [sharedCount, setSharedCount] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [comfortRange, setComfortRange] = useState<{ minPaise: number; maxPaise: number } | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch(`/api/groups/${groupId}/preferences`)
      .then((r) => r.json())
      .then((data) => {
        if (data.mine) {
          setMine(data.mine);
          setBudgetInput(data.mine.secretBudgetPaise != null ? String(data.mine.secretBudgetPaise / 100) : "");
        }
        setSharedCount(data.sharedCount ?? 0);
        setTotalMembers(data.totalMembers ?? 0);
        setComfortRange(data.comfortRange ?? null);
        setLoading(false);
      });
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedInterests = new Set(mine.interests ? mine.interests.split(",") : []);

  function toggleInterest(chip: InterestChip) {
    const next = new Set(selectedInterests);
    if (next.has(chip)) next.delete(chip);
    else next.add(chip);
    setMine((m) => ({ ...m, interests: Array.from(next).join(",") }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const secretBudgetPaise = budgetInput.trim() ? Math.round(parseFloat(budgetInput) * 100) : undefined;
    const res = await fetch(`/api/groups/${groupId}/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pace: mine.pace,
        interests: mine.interests ? mine.interests.split(",") : [],
        foodPreference: mine.foodPreference ?? undefined,
        stayPreference: mine.stayPreference ?? undefined,
        secretBudgetPaise,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      load();
    }
  }

  async function remind() {
    setReminding(true);
    await fetch(`/api/groups/${groupId}/preferences`, { method: "POST" });
    setReminding(false);
  }

  async function findMatches() {
    setMatching(true);
    setMatchError(null);
    const res = await fetch(`/api/groups/${groupId}/trip-match`, { method: "POST" });
    const data = await res.json();
    setMatching(false);
    if (!res.ok) {
      setMatchError(data.error ?? "Couldn't find matches");
      return;
    }
    setMatches(data.results);
  }

  async function shareToChat(match: MatchResult) {
    setSharedId(match.tourId);
    await fetch(`/api/groups/${groupId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${match.label}: ${match.title}`, messageKind: "PACKAGE", attachmentTourId: match.tourId }),
    });
    setSharedId(null);
  }

  if (loading) return <div className="skeleton h-64 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm">
          <strong>{sharedCount} of {totalMembers}</strong> members have shared preferences.
          {comfortRange && (
            <> Your group is comfortable at <strong>{formatRupees(comfortRange.minPaise)}–{formatRupees(comfortRange.maxPaise)}</strong> per person.</>
          )}
        </p>
        <button onClick={remind} disabled={reminding} className="min-h-9 rounded-md border border-border px-3 text-sm font-semibold press-feedback disabled:opacity-60">
          {reminding ? "Nudging…" : "Remind the group"}
        </button>
      </div>

      <form onSubmit={save} className="rounded-xl border border-border bg-surface p-4 space-y-5">
        <div>
          <label className="block text-sm font-medium">Travel pace: {PACE_LABELS[mine.pace - 1]}</label>
          <input
            type="range"
            min={1}
            max={5}
            value={mine.pace}
            onChange={(e) => setMine((m) => ({ ...m, pace: Number(e.target.value) }))}
            className="mt-2 w-full"
          />
        </div>

        <div>
          <p className="text-sm font-medium">Interests</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTEREST_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => toggleInterest(chip)}
                className={`min-h-9 rounded-full border px-3 text-sm font-medium press-feedback ${
                  selectedInterests.has(chip) ? "border-accent bg-accent text-white" : "border-border bg-background"
                }`}
              >
                {chip.charAt(0) + chip.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Food preference
            <select
              value={mine.foodPreference ?? ""}
              onChange={(e) => setMine((m) => ({ ...m, foodPreference: e.target.value || null }))}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
            >
              <option value="">Not set</option>
              {FOOD_PREFERENCES.map((f) => (
                <option key={f} value={f}>{f.replace("_", "-")}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Stay preference
            <select
              value={mine.stayPreference ?? ""}
              onChange={(e) => setMine((m) => ({ ...m, stayPreference: e.target.value || null }))}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
            >
              <option value="">Not set</option>
              {STAY_PREFERENCES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium">
          Your secret budget per person (Rs.) — only you can see this
          <input
            type="number"
            min={0}
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="e.g. 10000"
            className="mt-1 min-h-11 w-full max-w-xs rounded-md border border-border bg-background px-3"
          />
        </label>

        <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60">
          {saving ? "Saving…" : "Save my preferences"}
        </button>
        {saved && <p className="text-sm text-foreground-muted">Saved — your budget stays private to you.</p>}
      </form>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">AI Trip Match</h2>
            <p className="text-sm text-foreground-muted">Finds 3 tours from our catalogue that fit everyone&apos;s vibe and budget.</p>
          </div>
          <button onClick={findMatches} disabled={matching} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60">
            {matching ? "Matching…" : "Find our perfect trip"}
          </button>
        </div>

        {matchError && <p className="mt-3 text-sm text-danger">{matchError}</p>}

        {matches && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {matches.map((m) => (
              <div key={m.tourId} className="rounded-xl border border-border bg-background p-4">
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">{m.label}</span>
                <Link href={`/tours/${m.slug}`} className="mt-2 block font-semibold hover:text-accent">{m.title}</Link>
                {m.pricePerPerson != null && <p className="text-sm text-foreground-muted">{formatRupees(m.pricePerPerson)} per person</p>}
                <p className="mt-2 text-sm font-semibold">Group Match Score: {m.groupScore}%</p>
                <div className="mt-1 space-y-1">
                  {m.memberScores.map((s) => (
                    <div key={s.memberId} className="h-1.5 rounded-full bg-border">
                      <div className="h-1.5 rounded-full bg-accent" style={{ width: `${s.score}%` }} />
                    </div>
                  ))}
                </div>
                {m.budgetWarning && <p className="mt-2 text-xs text-danger">This stretches 1 member&apos;s budget</p>}
                <button
                  onClick={() => shareToChat(m)}
                  disabled={sharedId === m.tourId}
                  className="mt-3 min-h-9 w-full rounded-md border border-border text-sm font-semibold press-feedback disabled:opacity-60"
                >
                  {sharedId === m.tourId ? "Sharing…" : "Share to group chat"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
