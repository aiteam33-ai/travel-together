"use client";

import { useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Seamless infinite horizontal marquee: duplicates `children` once and
 * animates the whole track -50%, looping. Pauses on hover/focus (desktop)
 * and on touch (so a swipe/scroll doesn't fight the animation on mobile) —
 * the track itself still scrolls natively via overflow-x when paused.
 * Reduced motion: renders a single, scrollable (not auto-animating) row.
 */
export default function Marquee({
  children,
  durationSeconds = 30,
  reverse = false,
  className = "",
}: {
  children: React.ReactNode;
  durationSeconds?: number;
  reverse?: boolean;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

  if (reduced) {
    return <div className={`flex gap-4 overflow-x-auto ${className}`}>{children}</div>;
  }

  return (
    <div
      className={`overflow-x-auto overflow-y-hidden [scrollbar-width:none] ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className="flex w-max gap-4"
        style={{
          animation: `marquee-scroll ${durationSeconds}s linear infinite ${reverse ? "reverse" : ""}`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        <div className="flex shrink-0 gap-4">{children}</div>
        <div className="flex shrink-0 gap-4" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
