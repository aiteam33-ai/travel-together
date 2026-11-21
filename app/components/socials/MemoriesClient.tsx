"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MemoriesClient({ groupId, hasTour, isOrganiser }: { groupId: string; hasTour: boolean; isOrganiser: boolean }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photoUrls, setPhotoUrls] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [planning, setPlanning] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const urls = photoUrls.split(",").map((s) => s.trim()).filter(Boolean);
    const res = await fetch(`/api/groups/${groupId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, text, photoUrls: urls }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setText("");
      setPhotoUrls("");
    }
  }

  async function planNext() {
    setPlanning(true);
    const res = await fetch(`/api/groups/${groupId}/plan-next`, { method: "POST" });
    const data = await res.json();
    setPlanning(false);
    if (res.ok) router.push(`/socials/${data.groupId}`);
  }

  return (
    <div className="space-y-4">
      {hasTour && (
        <form onSubmit={submitReview} className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">Leave a review</h2>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl ${n <= rating ? "text-accent" : "text-border"}`}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How was the trip?"
            rows={3}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={photoUrls}
            onChange={(e) => setPhotoUrls(e.target.value)}
            placeholder="Photo URLs, comma-separated (optional)"
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button type="submit" disabled={saving} className="mt-2 min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60">
            {saving ? "Posting…" : "Post review"}
          </button>
          {saved && <p className="mt-1 text-sm text-success">Thanks — your review is live on the tour page.</p>}
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/groups/${groupId}/expenses/summary.pdf`}
          target="_blank"
          rel="noreferrer"
          className="min-h-11 rounded-md border border-border px-4 py-2.5 text-sm font-semibold press-feedback"
        >
          Download final expense summary (PDF)
        </a>
        {isOrganiser && (
          <button
            onClick={planNext}
            disabled={planning}
            className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60"
          >
            {planning ? "Creating…" : "Plan the next one"}
          </button>
        )}
      </div>
    </div>
  );
}
