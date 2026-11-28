"use client";

import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Site-wide smooth scrolling (Lenis). Renders nothing — just hooks into the
 * window's scroll loop for the lifetime of the app. Skipped entirely under
 * reduced motion, where native instant scrolling is what the user asked for.
 */
export default function LenisProvider() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let lenis: { raf: (time: number) => void; destroy: () => void } | undefined;
    let rafId: number;

    (async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({ autoRaf: false });
      const raf = (time: number) => {
        lenis!.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    })();

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [reduced]);

  return null;
}
