"use client";

import { useState } from "react";

export default function EnquireButton({ tourId, tourTitle }: { tourId: string; tourTitle: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, source: "ENQUIRY_FORM", tourId, message: message || `Enquiry about ${tourTitle}` }),
    });
    setSent(true);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-md border border-border px-4 py-2 text-center font-semibold hover:border-accent">
        Enquire
      </button>
    );
  }

  return (
    <div role="dialog" aria-label={`Enquire about ${tourTitle}`} className="rounded-md border border-border p-3">
      {sent ? (
        <p className="text-sm">Thanks! Our team will reach out on WhatsApp or phone shortly.</p>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <label className="block text-sm">
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
          </label>
          <label className="block text-sm">
            Mobile number
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
          </label>
          <label className="block text-sm">
            Message (optional)
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
          </label>
          <button type="submit" className="w-full rounded-md bg-accent py-1.5 text-sm font-semibold text-white">Send enquiry</button>
        </form>
      )}
    </div>
  );
}
