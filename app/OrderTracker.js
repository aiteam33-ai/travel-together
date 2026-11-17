"use client";

import { TRACKING_STEPS } from "./CartContext";

export default function OrderTracker({ status }) {
  const currentIndex = Math.max(0, TRACKING_STEPS.indexOf(status));
  const isDelivered = currentIndex === TRACKING_STEPS.length - 1;
  const fillPercent = isDelivered
    ? 100
    : ((currentIndex + 0.5) / TRACKING_STEPS.length) * 100;

  return (
    <div className="relative pt-2">
      <div className="absolute left-0 right-0 top-[22px] h-1 rounded-full bg-border" />
      <div
        className="absolute left-0 top-[22px] h-1 rounded-full bg-accent transition-[width] duration-500"
        style={{ width: `${fillPercent}%` }}
      />

      <div className="relative flex justify-between">
        {TRACKING_STEPS.map((step, i) => {
          const isLast = i === TRACKING_STEPS.length - 1;
          const done = i < currentIndex || (isLast && i === currentIndex);
          const current = i === currentIndex && !done;
          return (
            <div
              key={step}
              className="flex flex-col items-center gap-1"
              style={{ width: `${100 / TRACKING_STEPS.length}%` }}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-accent text-white"
                    : current
                    ? "bg-accent text-white"
                    : "border border-border bg-surface text-foreground-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`text-center text-[10px] leading-tight ${
                  i === currentIndex ? "font-semibold text-foreground" : "text-foreground-muted"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
