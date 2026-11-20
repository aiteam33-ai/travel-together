"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

const SESSION_KEY = "landingIntroPlayed";

/**
 * Landing intro (Stage 6, GSAP): headline, search bar and trust strip rise
 * and fade in sequence, once per browser session. The search bar is usable
 * immediately — GSAP animates opacity/transform only, inputs stay enabled
 * throughout.
 */
export default function LandingIntro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    if (played || !ref.current) return;

    let ctx: { revert: () => void } | undefined;
    (async () => {
      const gsap = (await import("gsap")).default;
      const targets = ref.current!.querySelectorAll("[data-intro]");
      if (targets.length === 0) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" }
        );
      });
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
    })();

    return () => ctx?.revert();
  }, [reduced]);

  return <div ref={ref}>{children}</div>;
}
