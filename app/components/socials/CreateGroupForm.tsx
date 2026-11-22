"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) router.push(`/socials/${data.groupId}/members`);
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <label className="text-sm font-medium">
        New group name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Goa Weekend"
          className="mt-1 min-h-11 w-64 rounded-md border border-border bg-background px-3"
        />
      </label>
      <button type="submit" disabled={creating} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60">
        {creating ? "Creating…" : "Create group"}
      </button>
    </form>
  );
}
