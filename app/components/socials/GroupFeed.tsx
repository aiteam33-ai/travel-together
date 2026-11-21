"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDateIST } from "@/lib/pricing/format";

interface Vote {
  memberId: string;
  value: "YES" | "MAYBE" | "NO";
  isVeto: boolean;
}

interface FeedItem {
  id: string;
  type: string;
  text: string;
  messageKind: string;
  attachmentUrl: string | null;
  attachmentTour: { id: string; slug: string; title: string; category: string; durationDays: number } | null;
  createdAt: string;
  author: { name: string } | null;
  votes: Vote[];
}

const POLL_MS = 8000;

export default function GroupFeed({ groupId, currentMemberId }: { groupId: string; currentMemberId: string }) {
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

  async function vote(itemId: string, value: "YES" | "MAYBE" | "NO", isVeto: boolean) {
    const res = await fetch(`/api/groups/${groupId}/feed/${itemId}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, isVeto }),
    });
    if (res.ok) refresh();
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
                <>
                  <Link href={`/tours/${item.attachmentTour.slug}`} className="mt-2 block rounded-lg border border-border p-2 hover:border-accent">
                    <p className="font-medium">{item.attachmentTour.title}</p>
                    <p className="text-xs text-foreground-muted">{item.attachmentTour.category} · {item.attachmentTour.durationDays} days</p>
                  </Link>
                  <VoteBar item={item} currentMemberId={currentMemberId} onVote={vote} />
                </>
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

function VoteBar({
  item,
  currentMemberId,
  onVote,
}: {
  item: FeedItem;
  currentMemberId: string;
  onVote: (itemId: string, value: "YES" | "MAYBE" | "NO", isVeto: boolean) => void;
}) {
  const mine = item.votes.find((v) => v.memberId === currentMemberId);
  const tally = { YES: 0, MAYBE: 0, NO: 0 };
  for (const v of item.votes) tally[v.value]++;
  const favourite = item.votes.length >= 3 && tally.YES > tally.MAYBE && tally.YES > tally.NO;
  const vetoed = item.votes.some((v) => v.isVeto);

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        {(["YES", "MAYBE", "NO"] as const).map((value) => (
          <button
            key={value}
            onClick={() => onVote(item.id, value, false)}
            className={`min-h-9 rounded-full border px-3 text-xs font-semibold press-feedback ${
              mine?.value === value && !mine.isVeto ? "border-accent bg-accent text-white" : "border-border bg-background"
            }`}
          >
            {value === "YES" ? "Yes" : value === "MAYBE" ? "Maybe" : "No"} ({tally[value]})
          </button>
        ))}
        <button
          onClick={() => onVote(item.id, "NO", true)}
          className={`min-h-9 rounded-full border px-3 text-xs font-semibold press-feedback ${
            mine?.isVeto ? "border-danger bg-danger text-white" : "border-border bg-background"
          }`}
        >
          Veto
        </button>
        {favourite && <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">Group&apos;s favourite</span>}
        {vetoed && <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">Vetoed</span>}
      </div>
    </div>
  );
}
