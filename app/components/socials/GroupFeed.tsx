"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDateIST } from "@/lib/pricing/format";

interface FeedItem {
  id: string;
  type: string;
  text: string;
  messageKind: string;
  attachmentUrl: string | null;
  attachmentTour: { id: string; slug: string; title: string; category: string; durationDays: number } | null;
  createdAt: string;
  author: { name: string } | null;
}

const POLL_MS = 8000;

export default function GroupFeed({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [text, setText] = useState("");
  const [kind, setKind] = useState<"TEXT" | "IMAGE" | "LINK">("TEXT");
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    fetch(`/api/groups/${groupId}/feed`)
      .then((r) => r.json())
      .then((data) => setItems([...(data.items ?? [])].reverse()));
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [items]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    const body: Record<string, string> =
      kind === "TEXT" ? { text, messageKind: "TEXT" } : { text, messageKind: kind, attachmentUrl: text };
    await fetch(`/api/groups/${groupId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setText("");
    setKind("TEXT");
    setPosting(false);
    refresh();
  }

  return (
    <div>
      <ul className="max-h-[480px] space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
        {items.map((item) =>
          item.type === "SYSTEM" ? (
            <li key={item.id} className="text-center text-xs text-foreground-muted">
              {item.text}
            </li>
          ) : (
            <li key={item.id} className="rounded-2xl border border-border bg-surface p-3 text-sm card-hover">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{item.author?.name ?? "Someone"}</span>
                <span className="text-xs text-foreground-muted">{formatDateIST(item.createdAt)}</span>
              </div>
              {item.messageKind === "IMAGE" && item.attachmentUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.attachmentUrl} alt="Shared" className="mt-2 max-h-64 w-full rounded-lg object-cover" />
              ) : item.messageKind === "LINK" && item.attachmentUrl ? (
                <a href={item.attachmentUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-accent underline">
                  {item.attachmentUrl}
                </a>
              ) : item.messageKind === "PACKAGE" && item.attachmentTour ? (
                <Link href={`/tours/${item.attachmentTour.slug}`} className="mt-2 block rounded-lg border border-border p-2 hover:border-accent">
                  <p className="font-medium">{item.attachmentTour.title}</p>
                  <p className="text-xs text-foreground-muted">{item.attachmentTour.category} · {item.attachmentTour.durationDays} days</p>
                </Link>
              ) : (
                <p className="mt-1">{item.text}</p>
              )}
            </li>
          )
        )}
        {items.length === 0 && <p className="text-sm text-foreground-muted">No messages yet — say hello!</p>}
        <div ref={bottomRef} />
      </ul>

      <form onSubmit={post} className="mt-3 flex flex-wrap gap-2">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as "TEXT" | "IMAGE" | "LINK")}
          className="min-h-11 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="TEXT">Message</option>
          <option value="IMAGE">Image URL</option>
          <option value="LINK">Link</option>
        </select>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={kind === "TEXT" ? "Message the group…" : "Paste a URL…"}
          className="min-h-11 flex-1 rounded-md border border-border bg-background px-3"
        />
        <button type="submit" disabled={posting} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback disabled:opacity-60">
          Send
        </button>
      </form>
    </div>
  );
}
