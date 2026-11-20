"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupForThisTripButton({ tourTitle }: { bookingId: string; tourTitle: string }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function create() {
    setCreating(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tourTitle }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) router.push(`/socials/${data.groupId}`);
  }

  return (
    <button type="button" onClick={create} disabled={creating} className="min-h-11 rounded-md border border-accent px-4 text-sm font-semibold text-accent press-feedback disabled:opacity-60">
      {creating ? "Creating…" : "Create a group for this trip"}
    </button>
  );
}
