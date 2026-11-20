"use client";

import { useState } from "react";

export default function ReviewModerationRow({
  review,
}: {
  review: { id: string; name: string; text: string; tourTitle: string; isSampleData: boolean; rating: number };
}) {
  const [deleted, setDeleted] = useState(false);

  async function remove() {
    await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    setDeleted(true);
  }

  if (deleted) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-sm">
      <p className="font-semibold">{review.name} — {review.rating}★ on {review.tourTitle} {review.isSampleData && <span className="ml-1 text-xs text-foreground-muted">(sample data)</span>}</p>
      <p className="mt-1 text-foreground-muted">{review.text}</p>
      <button type="button" onClick={remove} className="mt-2 rounded-md border border-danger px-2 py-1 text-xs text-danger">Remove</button>
    </div>
  );
}
