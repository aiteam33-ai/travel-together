"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateIST } from "@/lib/pricing/format";

interface FeedItem {
  id: string;
  type: string;
  text: string;
  createdAt: string;
  author: { name: string } | null;
}

const POLL_MS = 15000;

export default function GroupFeed({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const refresh = useCallback(() => {
    fetch(`/api/groups/${groupId}/feed`)
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []));
  }, [groupId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    await fetch(`/api/groups/${groupId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
    setPosting(false);
    refresh();
  }

  return (
    <div>
      <form onSubmit={post} className="flex gap-2">
        <label className="sr-only" htmlFor="feed-post">Post an update</label>
        <input
          id="feed-post"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Post an update…"
          className="min-h-11 flex-1 rounded-md border border-border bg-background px-3"
        />
        <button type="submit" disabled={posting} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60">
          Post
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id} className={`rounded-md p-3 text-sm ${item.type === "SYSTEM" ? "bg-background text-foreground-muted" : "bg-surface border border-border"}`}>
            {item.type !== "SYSTEM" && <span className="font-semibold">{item.author?.name ?? "Someone"}: </span>}
            {item.text}
            <span className="ml-2 text-xs text-foreground-muted">{formatDateIST(item.createdAt)}</span>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-foreground-muted">No activity yet.</p>}
      </ul>
    </div>
  );
}
