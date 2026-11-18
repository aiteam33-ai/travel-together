"use client";
import { useEffect, useState } from "react";
import { Page } from "../../../components/ui";
import { getEvents } from "../../../lib/analytics";

export default function DebugEventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Reads from localStorage (an external system), once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvents(getEvents().slice().reverse());
  }, []);

  if (process.env.NODE_ENV === "production") {
    return (
      <Page>
        <p className="text-base">Not available in production.</p>
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold">Tracked events (last {events.length})</h1>
      <div className="flex flex-col gap-2">
        {events.map((e, i) => (
          <div key={i} className="border border-border rounded-2xl p-4 bg-bg-elevated text-sm font-mono">
            <p className="text-accent">{e.eventName}</p>
            <p className="text-fg-muted">{e.at}</p>
            {Object.keys(e.details || {}).length > 0 && <pre className="text-fg">{JSON.stringify(e.details)}</pre>}
          </div>
        ))}
        {events.length === 0 && <p className="text-base text-fg-muted">No events yet.</p>}
      </div>
    </Page>
  );
}
