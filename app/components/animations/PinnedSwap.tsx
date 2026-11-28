"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Desktop: pins the section while the user scrolls past it, swapping which
 * item is shown based on scroll progress through the pinned range. Mobile
 * and reduced-motion: renders all items as a normal stacked, staggered list
 * (no pinning — sticky-pin-on-short-viewport is a common source of janky,
 * trapped scrolling on phones, so it's intentionally skipped there).
 *
 * Items are pre-rendered React nodes, not a render-prop + raw data — a
 * function prop can't cross the server/client boundary from a server
 * component caller (this is itself a client component).
 */
export default function PinnedSwap({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const index = Math.min(items.length - 1, Math.floor(v * items.length));
    setActive(index);
  });

  if (reduced) {
    return (
      <div className={className}>
        {items.map((item, i) => (
          <div key={i} className="py-6">
            {item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: normal stacked list, no pinning */}
      <div className={`md:hidden ${className ?? ""}`}>
        {items.map((item, i) => (
          <div key={i} className="py-6">
            {item}
          </div>
        ))}
      </div>

      {/* Desktop: pinned, scroll-driven swap. The sticky layer is sized to
          the content (not the full viewport) so there's no large empty gap
          of bare background around the small card while scrolling through
          the track. */}
      <div ref={ref} className="relative hidden md:block" style={{ height: `${items.length * 45}vh` }}>
        <div className="sticky top-24 flex items-center justify-center py-10">
          <div className="relative w-full">
            {items.map((item, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: active === i ? 1 : 0, y: active === i ? 0 : 12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ pointerEvents: active === i ? "auto" : "none" }}
              >
                <div className={className}>{item}</div>
              </motion.div>
            ))}
            {/* Reserves real layout height (the absolute items above don't), so the
                centering container isn't collapsed to zero height. */}
            <div className="invisible" aria-hidden="true">
              <div className={className}>{items[0]}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
