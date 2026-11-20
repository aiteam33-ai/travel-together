"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { useToast } from "../ToastContext";

export default function InviteWidget({ groupId }: { groupId: string }) {
  const { showToast } = useToast();
  const [link, setLink] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createLink() {
    const res = await fetch(`/api/groups/${groupId}/invite-link`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      const fullUrl = `${window.location.origin}${data.path}`;
      setLink(fullUrl);
    }
  }

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      showToast("Link copied");
    } catch {}
  }

  async function invitePhone(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not invite.");
      return;
    }
    setName("");
    setPhone("");
    showToast("Invite sent");
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-2 font-semibold">Invite people</h2>
      {!link ? (
        <button type="button" onClick={createLink} className="min-h-11 w-full rounded-md border border-border px-3 text-sm font-semibold press-feedback">
          Get invite link
        </button>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="break-all rounded-md bg-background p-2 text-xs">{link}</p>
          <div className="flex gap-2">
            <button type="button" onClick={copyLink} className="min-h-11 flex-1 rounded-md border border-border text-sm font-semibold press-feedback">
              Copy link
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join our trip group on ${BRAND.name}: ${link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-success text-sm font-semibold text-white press-feedback"
            >
              WhatsApp
            </a>
          </div>
          <p className="text-xs text-foreground-muted">Expires in 7 days.</p>
        </div>
      )}

      <form onSubmit={invitePhone} className="mt-4 space-y-2">
        <label className="block text-sm">
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
        </label>
        <label className="block text-sm">
          Mobile number
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2" />
        </label>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={sending} className="min-h-11 w-full rounded-md bg-accent text-sm font-semibold text-white press-feedback disabled:opacity-60">
          {sending ? "Sending…" : "Invite by number"}
        </button>
      </form>
    </section>
  );
}
