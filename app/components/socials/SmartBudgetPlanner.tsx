"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatRupees } from "@/lib/pricing/format";
import { BUDGET_CATEGORY_LABELS, BudgetCategories } from "@/lib/budget/engine";
import { useToast } from "../ToastContext";

interface Match {
  id: string;
  slug: string;
  title: string;
  heroImage: string;
  durationDays: number;
  durationNights: number;
  category: string;
  cheapestPerPerson: number;
  totalForGroup: number;
  withinBudget: boolean;
  diffFromBudget: number;
}

interface PlanResult {
  allocation: BudgetCategories;
  perPersonPaise: number;
  matches: Match[];
  anyWithinBudget: boolean;
}

const CATEGORY_KEYS = Object.keys(BUDGET_CATEGORY_LABELS) as (keyof BudgetCategories)[];

export default function SmartBudgetPlanner({
  groupId,
  defaultTravellers,
}: {
  groupId: string;
  defaultTravellers: number;
}) {
  const { showToast } = useToast();
  const [budget, setBudget] = useState("");
  const [travellers, setTravellers] = useState(String(Math.max(1, defaultTravellers)));
  const [days, setDays] = useState("5");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlanResult | null>(null);

  async function generate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    const totalPaise = Math.round(Number(budget) * 100);
    const travellerCount = Math.max(1, parseInt(travellers, 10) || 1);
    if (!totalPaise || totalPaise <= 0) {
      setError("Enter a total trip budget first.");
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      totalPaise: String(totalPaise),
      travellers: String(travellerCount),
      days: String(Math.max(1, parseInt(days, 10) || 5)),
    });
    const res = await fetch(`/api/groups/${groupId}/budget-match?${params.toString()}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not generate a plan.");
      return;
    }
    setResult(data);
  }

  async function shortlist(tourId: string) {
    await fetch(`/api/groups/${groupId}/shortlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId }),
    });
    showToast("Added to the group's shortlist");
  }

  async function shareToChat() {
    if (!result) return;
    setSharing(true);
    const totalPaise = Math.round(Number(budget) * 100);
    const lines = [
      `Budget plan: ${formatRupees(totalPaise)} total for ${travellers} people (${formatRupees(result.perPersonPaise)}/person).`,
      ...CATEGORY_KEYS.map((k) => `• ${BUDGET_CATEGORY_LABELS[k]}: ${formatRupees(result.allocation[k])}`),
      result.matches.length
        ? `Closest matching tours: ${result.matches.slice(0, 3).map((m) => m.title).join(", ")}.`
        : "No tours currently match this budget — try raising it or shortening the trip.",
    ];
    await fetch(`/api/groups/${groupId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n"), messageKind: "TEXT" }),
    });
    setSharing(false);
    showToast("Shared to the group chat");
  }

  async function saveAsGroupBudget() {
    if (!result) return;
    setSaving(true);
    const totalPaise = Math.round(Number(budget) * 100);
    const destination = result.matches[0]?.title ?? "Trip";
    await fetch(`/api/groups/${groupId}/budget`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        travellers: Math.max(1, parseInt(travellers, 10) || 1),
        days: Math.max(1, parseInt(days, 10) || 5),
        budgetLimitPaise: totalPaise,
        ...result.allocation,
      }),
    });
    setSaving(false);
    showToast("Saved as the group's trip budget");
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-heading text-lg font-bold">Smart budget-based trip planner</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Enter the group&apos;s total trip budget and this splits it across categories and matches real tours that
        actually fit — adjust and regenerate as many times as you like.
      </p>

      <form onSubmit={generate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          Total budget (₹)
          <input
            required
            type="number"
            min="0"
            step="100"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 60000"
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
          />
        </label>
        <label className="block text-sm font-medium">
          Travellers
          <input
            type="number"
            min={1}
            value={travellers}
            onChange={(e) => setTravellers(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
          />
        </label>
        <label className="block text-sm font-medium">
          Trip length (days)
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-3 min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60"
        >
          {loading ? "Generating…" : result ? "Regenerate plan" : "Generate plan"}
        </button>
      </form>

      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}

      {result && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-foreground-muted">Per-person cost</p>
              <p className="font-heading text-2xl font-bold">{formatRupees(result.perPersonPaise)}</p>
              <ul className="mt-4 space-y-2">
                {CATEGORY_KEYS.map((key) => {
                  const percent = Math.round(Number(budget) * 100) > 0 ? Math.round((result.allocation[key] / (Math.round(Number(budget) * 100))) * 100) : 0;
                  return (
                    <li key={key}>
                      <div className="flex justify-between text-sm">
                        <span>{BUDGET_CATEGORY_LABELS[key]}</span>
                        <span>{formatRupees(result.allocation[key])} ({percent}%)</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-border">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${percent}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={shareToChat}
                  disabled={sharing}
                  className="min-h-9 rounded-md border border-border px-3 text-xs font-semibold press-feedback disabled:opacity-60"
                >
                  {sharing ? "Sharing…" : "Share plan to group chat"}
                </button>
                <button
                  type="button"
                  onClick={saveAsGroupBudget}
                  disabled={saving}
                  className="min-h-9 rounded-md border border-border px-3 text-xs font-semibold press-feedback disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save as group budget"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-semibold">
                {result.anyWithinBudget ? "Tours that fit your budget" : "Nothing quite fits — closest options"}
              </p>
              {!result.anyWithinBudget && (
                <p className="mt-1 text-sm text-danger">
                  No upcoming tour for {travellers} people currently comes in at or under {formatRupees(Math.round(Number(budget) * 100))}.
                  Try raising the budget, fewer travellers, or a shorter trip.
                </p>
              )}
              {result.matches.length === 0 ? (
                <p className="mt-2 text-sm text-foreground-muted">No matching tours found for this trip length.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {result.matches.map((m) => (
                    <li key={m.id} className="flex gap-3 rounded-lg border border-border p-2">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
                        <Image src={m.heroImage} alt="" fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/tours/${m.slug}`} className="font-medium hover:text-accent">{m.title}</Link>
                        <p className="text-xs text-foreground-muted">{m.durationDays} days / {m.durationNights} nights</p>
                        <p className={`text-xs font-semibold ${m.withinBudget ? "text-success" : "text-danger"}`}>
                          {formatRupees(m.totalForGroup)} for {travellers}
                          {m.withinBudget
                            ? ` · ${formatRupees(-m.diffFromBudget)} under budget`
                            : ` · ${formatRupees(m.diffFromBudget)} over budget`}
                        </p>
                        <button
                          type="button"
                          onClick={() => shortlist(m.id)}
                          className="mt-1 text-xs font-semibold text-accent underline"
                        >
                          Add to shortlist
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
