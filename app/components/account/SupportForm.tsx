"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupportForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    setSubmitting(false);
    setSubject("");
    setMessage("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-4 max-w-md space-y-2 rounded-xl border border-border bg-surface p-4">
      <label className="block text-sm">
        Subject
        <input required value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
      </label>
      <label className="block text-sm">
        Message
        <textarea required value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5" />
      </label>
      <button type="submit" disabled={submitting} className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-white">
        {submitting ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
