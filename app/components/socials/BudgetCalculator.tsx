"use client";

import { useEffect, useState } from "react";
import { formatRupees } from "@/lib/pricing/format";
import { computeBudgetSummary, compareEstimateVsActual, BUDGET_CATEGORY_LABELS, type BudgetCategories } from "@/lib/budget/engine";

const CATEGORY_KEYS = Object.keys(BUDGET_CATEGORY_LABELS) as (keyof BudgetCategories)[];

type FormState = {
  destination: string;
  travellers: string;
  days: string;
  budgetLimit: string;
} & Record<keyof BudgetCategories, string>;

const EMPTY: FormState = {
  destination: "",
  travellers: "1",
  days: "1",
  budgetLimit: "",
  transportPaise: "0",
  accommodationPaise: "0",
  foodPaise: "0",
  activitiesPaise: "0",
  shoppingPaise: "0",
  otherPaise: "0",
};

export default function BudgetCalculator({ groupId }: { groupId: string }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [actualTotalPaise, setActualTotalPaise] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/${groupId}/budget`)
      .then((r) => r.json())
      .then((data) => {
        setActualTotalPaise(data.actualTotalPaise ?? 0);
        if (data.budget) {
          const b = data.budget;
          setForm({
            destination: b.destination,
            travellers: String(b.travellers),
            days: String(b.days),
            budgetLimit: b.budgetLimitPaise != null ? String(b.budgetLimitPaise / 100) : "",
            transportPaise: String(b.transportPaise / 100),
            accommodationPaise: String(b.accommodationPaise / 100),
            foodPaise: String(b.foodPaise / 100),
            activitiesPaise: String(b.activitiesPaise / 100),
            shoppingPaise: String(b.shoppingPaise / 100),
            otherPaise: String(b.otherPaise / 100),
          });
        }
        setLoading(false);
      });
  }, [groupId]);

  function num(v: string) {
    const n = Math.round(parseFloat(v || "0") * 100);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  const categories: BudgetCategories = {
    transportPaise: num(form.transportPaise),
    accommodationPaise: num(form.accommodationPaise),
    foodPaise: num(form.foodPaise),
    activitiesPaise: num(form.activitiesPaise),
    shoppingPaise: num(form.shoppingPaise),
    otherPaise: num(form.otherPaise),
  };
  const travellers = parseInt(form.travellers || "1", 10) || 1;
  const budgetLimitPaise = form.budgetLimit.trim() ? num(form.budgetLimit) : null;
  const summary = computeBudgetSummary(categories, travellers, budgetLimitPaise);
  const comparison = compareEstimateVsActual(summary.totalPaise, actualTotalPaise);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/groups/${groupId}/budget`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination: form.destination,
        travellers,
        days: parseInt(form.days || "1", 10) || 1,
        budgetLimitPaise,
        ...categories,
      }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  if (loading) return <div className="skeleton h-64 rounded-xl" />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-3">
        <label className="block text-sm font-medium">
          Destination
          <input
            required
            value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
          />
        </label>
        <div className="flex gap-3">
          <label className="flex-1 text-sm font-medium">
            Travellers
            <input
              type="number"
              min={1}
              value={form.travellers}
              onChange={(e) => setForm((f) => ({ ...f, travellers: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex-1 text-sm font-medium">
            Days
            <input
              type="number"
              min={1}
              value={form.days}
              onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
            />
          </label>
        </div>

        {CATEGORY_KEYS.map((key) => (
          <label key={key} className="block text-sm font-medium">
            {BUDGET_CATEGORY_LABELS[key]} (Rs.)
            <input
              type="number"
              min={0}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
            />
          </label>
        ))}

        <label className="block text-sm font-medium">
          Group budget limit (Rs., optional)
          <input
            type="number"
            min={0}
            value={form.budgetLimit}
            onChange={(e) => setForm((f) => ({ ...f, budgetLimit: e.target.value }))}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
          />
        </label>

        <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60">
          {saving ? "Saving…" : "Save budget for the group"}
        </button>
        {saved && <p className="text-sm text-foreground-muted">Saved — visible to every member.</p>}
      </form>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-foreground-muted">Total estimated cost</p>
        <p className="font-heading text-2xl font-bold">{formatRupees(summary.totalPaise)}</p>
        <p className="mt-1 text-sm text-foreground-muted">{formatRupees(summary.perPersonPaise)} per person</p>

        <ul className="mt-4 space-y-2">
          {summary.breakdown.map((b) => (
            <li key={b.key}>
              <div className="flex justify-between text-sm">
                <span>{b.label}</span>
                <span>{formatRupees(b.amountPaise)} ({b.percent}%)</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-background">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${b.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>

        {summary.remainingPaise != null && (
          <p className={`mt-4 text-sm font-semibold ${summary.overBudget ? "text-red-600" : "text-green-700"}`}>
            {summary.overBudget
              ? `Over budget by ${formatRupees(-summary.remainingPaise)}`
              : `${formatRupees(summary.remainingPaise)} remaining in budget`}
          </p>
        )}

        <div className="mt-4 border-t border-border pt-3 text-sm">
          <p className="font-semibold">Estimated vs. actual</p>
          <p className="text-foreground-muted">Actual group spending so far: {formatRupees(comparison.actualTotalPaise)}</p>
          <p className="text-foreground-muted">
            {comparison.differencePaise >= 0
              ? `${formatRupees(comparison.differencePaise)} over the estimate`
              : `${formatRupees(-comparison.differencePaise)} under the estimate`}{" "}
            ({comparison.percentOfEstimate}% of estimate)
          </p>
        </div>
      </div>
    </div>
  );
}
