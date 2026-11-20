"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";

export default function ContactWidgets() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  async function submitCallback(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, source: "CALLBACK_REQUEST" }),
    });
    setSent(true);
  }

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
      {open && (
        <div role="dialog" aria-label="Request a callback" className="w-72 rounded-xl border border-border bg-surface p-4 shadow-xl">
          {sent ? (
            <p className="text-sm">Thanks! Our team will call you back shortly.</p>
          ) : (
            <form onSubmit={submitCallback} className="space-y-2">
              <h2 className="font-semibold">Request a callback</h2>
              <label className="block text-sm">
                Name
                <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
              </label>
              <label className="block text-sm">
                Mobile number
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
              </label>
              <button type="submit" className="w-full rounded-md bg-accent py-1.5 text-sm font-semibold text-white">Request callback</button>
            </form>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold shadow"
          aria-expanded={open}
        >
          Request a callback
        </button>
        <a
          href={`https://wa.me/${BRAND.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-success px-4 py-2 text-sm font-semibold text-white shadow"
        >
          WhatsApp us
        </a>
      </div>
    </div>
  );
}
