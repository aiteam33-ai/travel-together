"use client";

import { useEffect, useState, useCallback } from "react";

type Person = { id: string; name: string; phone: string };
type Req = { id: string; fromUser?: Person; toUser?: Person };

export default function FriendsClient() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [friends, setFriends] = useState<Person[]>([]);
  const [incoming, setIncoming] = useState<Req[]>([]);
  const [outgoing, setOutgoing] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/friends")
      .then((r) => r.json())
      .then((data) => {
        setFriends(data.friends ?? []);
        setIncoming(data.incoming ?? []);
        setOutgoing(data.outgoing ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.users ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function sendRequest(toUserId: string) {
    setBusyId(toUserId);
    await fetch("/api/friends/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId }),
    });
    setBusyId(null);
    setResults((r) => r.filter((p) => p.id !== toUserId));
    load();
  }

  async function respond(id: string, action: "ACCEPT" | "REJECT") {
    setBusyId(id);
    await fetch(`/api/friends/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusyId(null);
    load();
  }

  const friendIds = new Set(friends.map((f) => f.id));
  const outgoingIds = new Set(outgoing.map((r) => r.toUser?.id));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-lg font-semibold">Find friends</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or phone"
          className="mt-2 min-h-11 w-full max-w-sm rounded-md border border-border bg-background px-3"
        />
        {results.length > 0 && (
          <ul className="mt-3 space-y-2">
            {results.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-foreground-muted">{p.phone}</p>
                </div>
                {friendIds.has(p.id) ? (
                  <span className="text-sm text-foreground-muted">Friends</span>
                ) : outgoingIds.has(p.id) ? (
                  <span className="text-sm text-foreground-muted">Requested</span>
                ) : (
                  <button
                    onClick={() => sendRequest(p.id)}
                    disabled={busyId === p.id}
                    className="min-h-9 rounded-md bg-accent px-3 text-sm font-semibold text-white press-feedback disabled:opacity-60"
                  >
                    Add friend
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {incoming.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-semibold">Friend requests</h2>
          <ul className="mt-3 space-y-2">
            {incoming.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div>
                  <p className="font-medium">{r.fromUser?.name}</p>
                  <p className="text-sm text-foreground-muted">{r.fromUser?.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(r.id, "ACCEPT")}
                    disabled={busyId === r.id}
                    className="min-h-9 rounded-md bg-accent px-3 text-sm font-semibold text-white press-feedback disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respond(r.id, "REJECT")}
                    disabled={busyId === r.id}
                    className="min-h-9 rounded-md border border-border px-3 text-sm font-semibold press-feedback disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-heading text-lg font-semibold">My friends</h2>
        {loading ? (
          <div className="mt-3 space-y-2">
            <div className="skeleton h-14 rounded-lg" />
            <div className="skeleton h-14 rounded-lg" />
          </div>
        ) : friends.length === 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">No friends yet — search above to add some.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {friends.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                <div>
                  <p className="font-medium">{f.name}</p>
                  <p className="text-sm text-foreground-muted">{f.phone}</p>
                </div>
                <a href={`/socials/messages?with=${f.id}`} className="min-h-9 rounded-md border border-border px-3 py-1.5 text-sm font-semibold press-feedback">
                  Message
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
