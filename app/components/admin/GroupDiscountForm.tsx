"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupees } from "@/lib/pricing/format";

interface Tier {
  id: string;
  minTravellers: number;
  discountPerPersonPaise: number;
}

export default function GroupDiscountForm({ tiers }: { tiers: Tier[] }) {
  const router = useRouter();
  const [minTravellers, setMinTravellers] = useState(6);
  const [discountRupees, setDiscountRupees] = useState(2000);
  const [saving, setSaving] = useState(false);

  async function addTier(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/group-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minTravellers, discountPerPersonPaise: discountRupees * 100 }),
    });
    setSaving(false);
    router.refresh();
  }

  async function removeTier(id: string) {
    await fetch(`/api/admin/group-discount/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-2 max-w-lg">
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th>Min travellers</th><th>Discount / person</th><th /></tr></thead>
        <tbody>
          {tiers.map((t) => (
            <tr key={t.id} className="border-t border-border">
              <td className="py-1">{t.minTravellers}+</td>
              <td>{formatRupees(t.discountPerPersonPaise)}</td>
              <td>
                <button type="button" onClick={() => removeTier(t.id)} className="text-xs text-danger underline">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={addTier} className="mt-3 flex items-end gap-2">
        <label className="text-sm">
          Min travellers
          <input type="number" min={2} value={minTravellers} onChange={(e) => setMinTravellers(Number(e.target.value))} className="mt-1 block w-24 rounded-md border border-border bg-background px-2 py-1" />
        </label>
        <label className="text-sm">
          Discount per person (₹)
          <input type="number" min={0} value={discountRupees} onChange={(e) => setDiscountRupees(Number(e.target.value))} className="mt-1 block w-32 rounded-md border border-border bg-background px-2 py-1" />
        </label>
        <button type="submit" disabled={saving} className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold">
          Add tier
        </button>
      </form>
    </div>
  );
}
