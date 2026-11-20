"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TaxConfigForm({ configs }: { configs: { key: string; value: number; note: string | null }[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>(Object.fromEntries(configs.map((c) => [c.key, c.value])));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(key: string) {
    setSaving(true);
    await fetch("/api/admin/tax-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] }),
    });
    setSaving(false);
    setMsg(`${key} updated.`);
    router.refresh();
  }

  return (
    <div className="mt-2 space-y-2">
      {configs.map((c) => (
        <div key={c.key} className="flex items-center gap-2">
          <label className="w-56 text-sm">{c.key}</label>
          <input
            type="number"
            step="0.1"
            value={values[c.key]}
            onChange={(e) => setValues((v) => ({ ...v, [c.key]: Number(e.target.value) }))}
            className="w-24 rounded-md border border-border bg-background px-2 py-1"
          />
          <span className="text-sm">%</span>
          <button type="button" disabled={saving} onClick={() => save(c.key)} className="rounded-md border border-border px-2 py-1 text-xs font-semibold">
            Save
          </button>
          <span className="text-xs text-foreground-muted">{c.note}</span>
        </div>
      ))}
      {msg && <p role="status" className="text-sm text-success">{msg}</p>}
    </div>
  );
}
