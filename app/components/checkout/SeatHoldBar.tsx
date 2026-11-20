"use client";

import { useEffect, useRef, useState } from "react";

const HOLD_SECONDS = 15 * 60;
const WARN_SECONDS = 2 * 60;

export default function SeatHoldBar({
  holdExpiresAt,
  onExpired,
}: {
  holdExpiresAt: string;
  onExpired: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const expiredFired = useRef(false);

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0 && !expiredFired.current) {
        expiredFired.current = true;
        onExpired();
      }
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdExpiresAt]);

  if (secondsLeft === null) return null;

  const expired = secondsLeft === 0;
  const warning = secondsLeft <= WARN_SECONDS;
  const percentLeft = Math.max(0, Math.min(100, Math.round((secondsLeft / HOLD_SECONDS) * 100)));

  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className={expired ? "text-danger" : warning ? "text-danger" : "text-foreground"}>
          {expired ? "Seat hold expired" : `Seats held for ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${warning ? "bg-danger" : "bg-accent"}`}
          style={{ width: `${percentLeft}%` }}
        />
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {warning && !expired ? "Two minutes left on your seat hold." : ""}
        {expired ? "Your seat hold has expired." : ""}
      </p>
    </div>
  );
}
