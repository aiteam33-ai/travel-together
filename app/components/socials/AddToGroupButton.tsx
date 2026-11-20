"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthContext";
import LoginModal from "../auth/LoginModal";
import { useToast } from "../ToastContext";

interface GroupOption {
  id: string;
  name: string;
}

export default function AddToGroupButton({ tourId, label = "Plan this with your group" }: { tourId: string; label?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [groups, setGroups] = useState<GroupOption[] | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  async function openPicker() {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setOpen(true);
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data.groups ?? []);
  }

  async function addTo(groupId: string) {
    await fetch(`/api/groups/${groupId}/shortlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId }),
    });
    setOpen(false);
    showToast("Added to group shortlist");
    router.push(`/socials/${groupId}/plan`);
  }

  async function createAndAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName }),
    });
    const data = await res.json();
    if (res.ok) await addTo(data.groupId);
  }

  return (
    <div className="relative">
      <button type="button" onClick={openPicker} className="flex min-h-11 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-semibold press-feedback">
        {label}
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-md border border-border bg-surface-raised p-3 shadow-[var(--shadow-raised)]">
          {groups === null ? (
            <p className="text-sm text-foreground-muted">Loading…</p>
          ) : groups.length > 0 ? (
            <ul className="space-y-1">
              {groups.map((g) => (
                <li key={g.id}>
                  <button type="button" onClick={() => addTo(g.id)} className="min-h-11 w-full rounded-md px-2 text-left text-sm hover:bg-accent-soft">
                    {g.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-foreground-muted">You have no groups yet.</p>
          )}
          <form onSubmit={createAndAdd} className="mt-2 flex gap-2 border-t border-border pt-2">
            <input
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New group name"
              className="min-h-11 flex-1 rounded-md border border-border bg-background px-2 text-sm"
            />
            <button type="submit" className="min-h-11 rounded-md bg-accent px-3 text-xs font-semibold text-white press-feedback">
              Create &amp; add
            </button>
          </form>
        </div>
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
