"use client";

import { useEffect, useState } from "react";

interface Badge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

export default function BadgesPanel() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [tripsCompleted, setTripsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/badges")
      .then((r) => r.json())
      .then((data) => {
        setBadges(data.badges ?? []);
        setTripsCompleted(data.tripsCompleted ?? 0);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="skeleton mt-4 h-40 rounded-xl" />;

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="mt-4 max-w-md rounded-xl border border-border bg-surface p-4">
      <h2 className="font-heading text-lg font-semibold">Traveller profile</h2>
      <div className="mt-2 flex gap-6 text-sm">
        <div>
          <p className="font-heading text-2xl font-bold text-accent">{tripsCompleted}</p>
          <p className="text-xs text-foreground-muted">trips completed</p>
        </div>
        <div>
          <p className="font-heading text-2xl font-bold text-accent">{earnedCount}</p>
          <p className="text-xs text-foreground-muted">badges earned</p>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {badges.map((b) => (
          <li
            key={b.id}
            className={`rounded-lg border p-3 text-sm ${b.earned ? "border-accent bg-accent-soft" : "border-border bg-background opacity-60"}`}
          >
            <p className={`font-semibold ${b.earned ? "text-accent" : ""}`}>{b.earned ? "🏅 " : "— "}{b.label}</p>
            <p className="mt-1 text-xs text-foreground-muted">{b.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
