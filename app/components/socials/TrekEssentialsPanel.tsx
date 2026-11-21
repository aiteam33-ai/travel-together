"use client";

import { useEffect, useState, useCallback } from "react";

interface ChecklistItem {
  id: string;
  category: "GEAR" | "PACKING" | "PERMIT";
  label: string;
  mode: "RENT" | "OWN" | null;
  done: boolean;
  claimedByMemberId: string | null;
  claimedBy: { name: string } | null;
}

export default function TrekEssentialsPanel({
  groupId,
  bestSeason,
  difficulty,
}: {
  groupId: string;
  bestSeason: string;
  difficulty: string | null;
}) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [fitness, setFitness] = useState<number | null>(null);
  const [needsPrep, setNeedsPrep] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch(`/api/groups/${groupId}/checklist`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setMyMemberId(data.myMemberId ?? null);
        setLoading(false);
      });
  }, [groupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    fetch(`/api/groups/${groupId}/preferences`)
      .then((r) => r.json())
      .then((data) => setFitness(data.mine?.fitnessSelfRating ?? null));
  }, [groupId]);

  async function toggle(itemId: string, body: Record<string, unknown>) {
    await fetch(`/api/groups/${groupId}/checklist/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    refresh();
  }

  async function saveFitness(value: number) {
    setFitness(value);
    await fetch(`/api/groups/${groupId}/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fitnessSelfRating: value }),
    }).catch(() => {});
  }

  if (loading) return <div className="skeleton h-40 rounded-xl" />;

  const gear = items.filter((i) => i.category === "GEAR");
  const packing = items.filter((i) => i.category === "PACKING");
  const permits = items.filter((i) => i.category === "PERMIT");

  const minRequired = difficulty === "Difficult" ? 4 : difficulty === "Moderate" ? 3 : 1;
  const myFlag = fitness != null && fitness < minRequired;

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-semibold">Trek &amp; pilgrimage essentials</h2>
      <p className="mt-1 text-sm text-foreground-muted">Best season: {bestSeason}</p>

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-sm font-medium">Your fitness self-assessment {difficulty && <span className="text-foreground-muted">(tour difficulty: {difficulty})</span>}</p>
        <input
          type="range"
          min={1}
          max={5}
          value={fitness ?? 3}
          onChange={(e) => saveFitness(Number(e.target.value))}
          className="mt-2 w-full"
        />
        {myFlag && <p className="mt-1 text-xs font-semibold text-danger">You may want to prepare more before this trip.</p>}
      </div>

      {gear.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm font-medium">Gear checklist</p>
          <ul className="mt-2 space-y-1 text-sm">
            {gear.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2">
                <span>{i.label}</span>
                <select
                  value={i.mode ?? "OWN"}
                  onChange={(e) => toggle(i.id, { mode: e.target.value })}
                  className="min-h-9 rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="OWN">Carry your own</option>
                  <option value="RENT">Rent</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {packing.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm font-medium">Shared packing list</p>
          <ul className="mt-2 space-y-1 text-sm">
            {packing.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2">
                <span>{i.label}</span>
                {i.claimedBy ? (
                  <span className="text-xs text-foreground-muted">
                    {i.claimedByMemberId === myMemberId ? "You're" : `${i.claimedBy.name} is`} bringing this
                    {i.claimedByMemberId === myMemberId && (
                      <button onClick={() => toggle(i.id, { claim: false })} className="ml-2 underline">
                        Undo
                      </button>
                    )}
                  </span>
                ) : (
                  <button onClick={() => toggle(i.id, { claim: true })} className="min-h-9 rounded-md border border-border px-2 text-xs font-semibold press-feedback">
                    I&apos;ll bring this
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {permits.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm font-medium">Registration &amp; permits</p>
          <ul className="mt-2 space-y-1 text-sm">
            {permits.map((i) => (
              <li key={i.id}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={i.done} onChange={(e) => toggle(i.id, { done: e.target.checked })} />
                  {i.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
