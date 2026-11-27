"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDateIST } from "@/lib/pricing/format";

interface Vote {
  memberId: string;
  value: "YES" | "MAYBE" | "NO";
  isVeto: boolean;
}

interface PollOption {
  id: string;
  label: string;
  votes: { memberId: string }[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
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
  poll: Poll | null;
}

const POLL_MS = 8000;

export default function GroupFeed({
  groupId,
  currentMemberId,
  initialData,
}: {
  groupId: string;
  currentMemberId: string;
  initialData?: { items: FeedItem[] };
}) {
  const [items, setItems] = useState<FeedItem[]>(initialData ? [...initialData.items].reverse() : []);
  const [text, setText] = useState("");
  const [kind, setKind] = useState<"TEXT" | "IMAGE" | "LINK">("TEXT");
  const [posting, setPosting] = useState(false);
  const [pollDraft, setPollDraft] = useState<{ question: string; options: string[] } | null>(null);
  const [pollPosting, setPollPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Several things can call refresh() close together (the poll interval, the
  // window "focus" listener, and every action below) and their fetches can
  // resolve out of order. Without this guard, a slower, older response can
  // land after a newer one and overwrite the just-posted message/vote with
  // stale data — so only the response to the most recently *started* request
  // is ever applied.
  const refreshSeq = useRef(0);

  const refresh = useCallback(() => {
    const seq = ++refreshSeq.current;
    fetch(`/api/groups/${groupId}/feed`)
      .then((r) => r.json())
      .then((data) => {
        if (seq !== refreshSeq.current) return;
        setItems([...(data.items ?? [])].reverse());
      });
  }, [groupId]);

  useEffect(() => {
    if (!initialData) refresh();
    const interval = setInterval(refresh, POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialData is only read on mount
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

  async function pollVote(pollId: string, optionId: string) {
    const res = await fetch(`/api/groups/${groupId}/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    if (res.ok) refresh();
  }

  async function submitPoll(e: React.FormEvent) {
    e.preventDefault();
    if (!pollDraft) return;
    const question = pollDraft.question.trim();
    const options = pollDraft.options.map((o) => o.trim()).filter(Boolean);
    if (!question || options.length < 2) return;
    setPollPosting(true);
    await fetch(`/api/groups/${groupId}/feed/polls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options }),
    });
    setPollPosting(false);
    setPollDraft(null);
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
                <>
                  <Link href={`/tours/${item.attachmentTour.slug}`} className="mt-2 block rounded-lg border border-border p-2 hover:border-accent">
                    <p className="font-medium">{item.attachmentTour.title}</p>
                    <p className="text-xs text-foreground-muted">{item.attachmentTour.category} · {item.attachmentTour.durationDays} days</p>
                  </Link>
                  <VoteBar item={item} currentMemberId={currentMemberId} onVote={vote} />
                </>
              ) : item.messageKind === "POLL" && item.poll ? (
                <PollBlock poll={item.poll} currentMemberId={currentMemberId} onVote={pollVote} />
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

      {!pollDraft ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPollDraft({ question: "Which dates work?", options: ["", ""] })}
            className="min-h-9 rounded-md border border-border px-3 text-xs font-semibold press-feedback"
          >
            Poll: dates
          </button>
          <button
            type="button"
            onClick={() => setPollDraft({ question: "Which departure batch?", options: ["", ""] })}
            className="min-h-9 rounded-md border border-border px-3 text-xs font-semibold press-feedback"
          >
            Poll: departure batch
          </button>
          <button
            type="button"
            onClick={() => setPollDraft({ question: "", options: ["", ""] })}
            className="min-h-9 rounded-md border border-border px-3 text-xs font-semibold press-feedback"
          >
            Custom poll
          </button>
        </div>
      ) : (
        <form onSubmit={submitPoll} className="mt-3 space-y-2 rounded-lg border border-border bg-background p-3">
          <input
            value={pollDraft.question}
            onChange={(e) => setPollDraft((d) => (d ? { ...d, question: e.target.value } : d))}
            placeholder="Poll question"
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3"
          />
          {pollDraft.options.map((opt, i) => (
            <input
              key={i}
              value={opt}
              onChange={(e) =>
                setPollDraft((d) => (d ? { ...d, options: d.options.map((o, j) => (j === i ? e.target.value : o)) } : d))
              }
              placeholder={`Option ${i + 1}`}
              className="min-h-11 w-full rounded-md border border-border bg-surface px-3"
            />
          ))}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPollDraft((d) => (d && d.options.length < 8 ? { ...d, options: [...d.options, ""] } : d))}
              className="min-h-9 rounded-md border border-border px-3 text-xs font-semibold press-feedback"
            >
              + Add option
            </button>
            <button type="submit" disabled={pollPosting} className="min-h-9 rounded-md bg-accent px-3 text-xs font-semibold text-white press-feedback disabled:opacity-60">
              {pollPosting ? "Posting…" : "Post poll"}
            </button>
            <button type="button" onClick={() => setPollDraft(null)} className="min-h-9 rounded-md px-3 text-xs font-semibold text-foreground-muted">
              Cancel
            </button>
          </div>
        </form>
      )}
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

function PollBlock({
  poll,
  currentMemberId,
  onVote,
}: {
  poll: Poll;
  currentMemberId: string;
  onVote: (pollId: string, optionId: string) => void;
}) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  const myOptionId = poll.options.find((o) => o.votes.some((v) => v.memberId === currentMemberId))?.id;

  return (
    <div className="mt-2">
      <p className="font-medium">{poll.question}</p>
      <div className="mt-2 space-y-2">
        {poll.options.map((option) => {
          const count = option.votes.length;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const mine = option.id === myOptionId;
          return (
            <button
              key={option.id}
              onClick={() => onVote(poll.id, option.id)}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm press-feedback ${mine ? "border-accent" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <span className={mine ? "font-semibold text-accent" : ""}>{option.label}</span>
                <span className="text-xs text-foreground-muted">{count} vote{count === 1 ? "" : "s"} · {percent}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-border">
                <div className="h-1.5 rounded-full bg-accent" style={{ width: `${percent}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
