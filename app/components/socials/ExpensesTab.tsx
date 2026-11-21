"use client";

import { useCallback, useEffect, useState } from "react";
import { computeBalances, suggestSettlements } from "@/lib/expenses/engine";
import { formatRupees, formatDateIST } from "@/lib/pricing/format";
import { useToast } from "../ToastContext";

interface Member {
  id: string;
  name: string;
}

interface ApiExpense {
  id: string;
  description: string;
  amountPaise: number;
  date: string;
  paidByMemberId: string;
  splitType: "EQUAL" | "CUSTOM";
  createdByMemberId: string;
  fromBooking: boolean;
  paidBy: Member;
  createdBy: Member;
  participants: { memberId: string; shareAmountPaise: number }[];
}

interface ApiSettlement {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amountPaise: number;
  note: string | null;
  fromMember: Member;
  toMember: Member;
}

export default function ExpensesTab({
  groupId,
  members,
  currentMemberId,
  isOrganiser,
}: {
  groupId: string;
  members: Member[];
  currentMemberId: string;
  isOrganiser: boolean;
}) {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);
  const [settlements, setSettlements] = useState<ApiSettlement[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const refresh = useCallback(() => {
    fetch(`/api/groups/${groupId}/expenses`)
      .then((r) => r.json())
      .then((data) => {
        setExpenses(data.expenses ?? []);
        setSettlements(data.settlements ?? []);
      });
  }, [groupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "Someone";

  const balances = computeBalances(
    expenses.map((e) => ({
      id: e.id,
      amountPaise: e.amountPaise,
      paidByMemberId: e.paidByMemberId,
      participantMemberIds: e.participants.map((p) => p.memberId),
      splitType: e.splitType,
      customShares: e.splitType === "CUSTOM" ? Object.fromEntries(e.participants.map((p) => [p.memberId, p.shareAmountPaise])) : undefined,
    })),
    settlements.map((s) => ({ fromMemberId: s.fromMemberId, toMemberId: s.toMemberId, amountPaise: s.amountPaise }))
  );
  const suggestions = suggestSettlements(balances);
  const myBalance = balances.find((b) => b.memberId === currentMemberId)?.netPaise ?? 0;
  const rawObligationCount = expenses.reduce(
    (n, e) => n + e.participants.filter((p) => p.memberId !== e.paidByMemberId).length,
    0
  );

  function upiLink(toMemberId: string, toName: string, amountPaise: number) {
    const params = new URLSearchParams({
      pa: `${toMemberId}@mock`,
      pn: toName,
      am: (amountPaise / 100).toFixed(2),
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  }

  async function nudgeSettlement(fromMemberId: string, amountPaise: number) {
    const fromName = nameOf(fromMemberId);
    await fetch(`/api/groups/${groupId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `Reminder for ${fromName}: please settle ${formatRupees(amountPaise)}.`, messageKind: "TEXT" }),
    });
    showToast("Nudge sent in group chat");
  }

  async function deleteExpense(expenseId: string) {
    await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, { method: "DELETE" });
    showToast("Expense deleted");
    refresh();
  }

  async function recordSettlement(fromMemberId: string, toMemberId: string, amountPaise: number) {
    await fetch(`/api/groups/${groupId}/settlements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromMemberId, toMemberId, amountPaise }),
    });
    showToast("Settlement recorded");
    refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Expenses</h2>
          <button type="button" onClick={() => setShowAddForm((v) => !v)} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback">
            {showAddForm ? "Close" : "Add expense"}
          </button>
        </div>

        {showAddForm && (
          <AddExpenseForm
            groupId={groupId}
            members={members}
            defaultPayerId={currentMemberId}
            onSaved={() => {
              setShowAddForm(false);
              refresh();
            }}
          />
        )}

        <ul className="mt-4 space-y-2">
          {expenses.map((e) => (
            <li key={e.id} className="rounded-md border border-border bg-surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{e.description}</p>
                <p className="font-semibold">{formatRupees(e.amountPaise)}</p>
              </div>
              <p className="text-xs text-foreground-muted">
                Paid by {e.paidBy.name} · {formatDateIST(e.date)} · split {e.splitType.toLowerCase()} among{" "}
                {e.participants.map((p) => nameOf(p.memberId)).join(", ")}
                {e.fromBooking && " · from booking"}
              </p>
              {(e.createdByMemberId === currentMemberId || isOrganiser) && (
                <button type="button" onClick={() => deleteExpense(e.id)} className="mt-1 text-xs text-danger underline">
                  Delete
                </button>
              )}
            </li>
          ))}
          {expenses.length === 0 && <p className="text-sm text-foreground-muted">No expenses recorded yet.</p>}
        </ul>

        {settlements.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold">Settlements</h3>
            <ul className="mt-2 space-y-1 text-sm text-foreground-muted">
              {settlements.map((s) => (
                <li key={s.id}>{s.fromMember.name} paid {s.toMember.name} {formatRupees(s.amountPaise)}{s.note && ` — ${s.note}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-2 font-semibold">Your balance</h2>
          <p className="text-sm">
            {myBalance === 0
              ? "You're all settled up."
              : myBalance > 0
                ? `You are owed ${formatRupees(myBalance)}`
                : `You owe ${formatRupees(-myBalance)}`}
          </p>
          <ul className="mt-3 space-y-1 text-xs text-foreground-muted">
            {balances
              .filter((b) => b.memberId !== currentMemberId)
              .map((b) => (
                <li key={b.memberId}>
                  {nameOf(b.memberId)}: {b.netPaise === 0 ? "settled" : b.netPaise > 0 ? `owed ${formatRupees(b.netPaise)}` : `owes ${formatRupees(-b.netPaise)}`}
                </li>
              ))}
          </ul>
        </section>

        {suggestions.length > 0 && (
          <section className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 font-semibold">Suggested settlements</h2>
            {rawObligationCount > suggestions.length && (
              <p className="mb-2 text-xs text-foreground-muted">
                Instead of {rawObligationCount} payments, just {suggestions.length}.
              </p>
            )}
            <ul className="space-y-2 text-sm">
              {suggestions.map((s, i) => (
                <li key={i} className="flex flex-col gap-1 border-b border-border pb-2 last:border-0 last:pb-0">
                  <span>
                    {nameOf(s.fromMemberId)} → {nameOf(s.toMemberId)}: {formatRupees(s.amountPaise)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(s.fromMemberId === currentMemberId || s.toMemberId === currentMemberId) && (
                      <button
                        type="button"
                        onClick={() => recordSettlement(s.fromMemberId, s.toMemberId, s.amountPaise)}
                        className="min-h-9 shrink-0 rounded-md border border-border px-2 text-xs font-semibold press-feedback"
                      >
                        Mark paid
                      </button>
                    )}
                    {s.fromMemberId === currentMemberId && (
                      <a
                        href={upiLink(s.toMemberId, nameOf(s.toMemberId), s.amountPaise)}
                        className="min-h-9 shrink-0 rounded-md border border-border px-2 text-xs font-semibold press-feedback"
                      >
                        Pay via UPI (mock)
                      </a>
                    )}
                    {s.toMemberId === currentMemberId && (
                      <button
                        type="button"
                        onClick={() => nudgeSettlement(s.fromMemberId, s.amountPaise)}
                        className="min-h-9 shrink-0 rounded-md border border-border px-2 text-xs font-semibold press-feedback"
                      >
                        Nudge
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}

function AddExpenseForm({
  groupId,
  members,
  defaultPayerId,
  onSaved,
}: {
  groupId: string;
  members: Member[];
  defaultPayerId: string;
  onSaved: () => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidByMemberId, setPaidByMemberId] = useState(defaultPayerId);
  const [participantIds, setParticipantIds] = useState<string[]>(members.map((m) => m.id));
  const [splitType, setSplitType] = useState<"EQUAL" | "CUSTOM">("EQUAL");
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleParticipant(id: string) {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amountPaise = Math.round(Number(amount) * 100);
    if (!amountPaise || amountPaise <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    const body: Record<string, unknown> = {
      description,
      amountPaise,
      date,
      paidByMemberId,
      participantMemberIds: participantIds,
      splitType,
    };
    if (splitType === "CUSTOM") {
      const shares: Record<string, number> = {};
      for (const id of participantIds) shares[id] = Math.round(Number(customShares[id] ?? 0) * 100);
      body.customShares = shares;
    }
    setSaving(true);
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not add expense — check the split adds up.");
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={submit} className="mb-4 space-y-3 rounded-md border border-border bg-surface p-3">
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <label className="block text-sm">
        Description
        <input required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm">
          Amount (₹)
          <input required type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
        </label>
        <label className="block text-sm">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
        </label>
      </div>
      <label className="block text-sm">
        Paid by
        <select value={paidByMemberId} onChange={(e) => setPaidByMemberId(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2">
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-sm font-medium">Shares with</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {members.map((m) => (
            <label key={m.id} className="flex min-h-11 items-center gap-1 rounded-md border border-border px-2 text-sm">
              <input type="checkbox" checked={participantIds.includes(m.id)} onChange={() => toggleParticipant(m.id)} />
              {m.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm">
        Split
        <select value={splitType} onChange={(e) => setSplitType(e.target.value as "EQUAL" | "CUSTOM")} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2">
          <option value="EQUAL">Equal</option>
          <option value="CUSTOM">Custom amounts</option>
        </select>
      </label>
      {splitType === "CUSTOM" && (
        <div className="space-y-1">
          {participantIds.map((id) => (
            <label key={id} className="flex items-center justify-between text-sm">
              {members.find((m) => m.id === id)?.name}
              <input
                type="number"
                min="0"
                step="0.01"
                value={customShares[id] ?? ""}
                onChange={(e) => setCustomShares((prev) => ({ ...prev, [id]: e.target.value }))}
                className="min-h-11 w-28 rounded-md border border-border bg-background px-2"
              />
            </label>
          ))}
        </div>
      )}
      <button type="submit" disabled={saving} className="min-h-11 w-full rounded-md bg-accent text-sm font-semibold text-white press-feedback disabled:opacity-60">
        {saving ? "Saving…" : "Add expense"}
      </button>
    </form>
  );
}
