"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Person = { id: string; name: string; phone: string };
type DM = { id: string; fromUserId: string; toUserId: string; text: string; createdAt: string; readAt: string | null };
type Conversation = { friend: Person; lastMessage: DM | null; unreadCount: number };

export default function MessagesClient({ meId, initialWith }: { meId: string; initialWith?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(initialWith);
  const [messages, setMessages] = useState<DM[]>([]);
  const [other, setOther] = useState<Person | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations ?? []);
        setLoading(false);
      });
  }, []);

  const loadThread = useCallback((userId: string) => {
    fetch(`/api/messages/${userId}`).then((res) => {
      if (!res.ok) return;
      res.json().then((data) => {
        setMessages(data.messages ?? []);
        setOther(data.other ?? null);
      });
    });
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeId) loadThread(activeId);
  }, [activeId, loadThread]);

  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(() => loadThread(activeId), 8000);
    return () => clearInterval(interval);
  }, [activeId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim() || !activeId) return;
    const body = text;
    setText("");
    const res = await fetch(`/api/messages/${activeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: body }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((m) => [...m, data.message]);
      loadConversations();
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="skeleton h-14 rounded-lg" />
        <div className="skeleton h-14 rounded-lg" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-semibold">No conversations yet</p>
        <p className="mt-1 text-sm text-foreground-muted">Add friends to start chatting 1:1.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
      <ul className="space-y-1">
        {conversations.map(({ friend, lastMessage, unreadCount }) => (
          <li key={friend.id}>
            <button
              onClick={() => setActiveId(friend.id)}
              className={`w-full rounded-lg border p-3 text-left press-feedback ${activeId === friend.id ? "border-accent bg-surface" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{friend.name}</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">{unreadCount}</span>
                )}
              </div>
              {lastMessage && <p className="truncate text-sm text-foreground-muted">{lastMessage.text}</p>}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex min-h-[420px] flex-col rounded-xl border border-border bg-surface">
        {!activeId || !other ? (
          <div className="flex flex-1 items-center justify-center text-sm text-foreground-muted">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="border-b border-border p-3 font-semibold">{other.name}</div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.fromUserId === meId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      m.fromUserId === meId ? "bg-accent text-white" : "bg-background border border-border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 border-t border-border p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Message..."
                className="min-h-11 flex-1 rounded-md border border-border bg-background px-3"
              />
              <button onClick={send} className="min-h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback">
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
