"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

export default function ScrollRow({ children, stagger = false }: { children: React.ReactNode; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  function scrollBy(dir: 1 | -1) {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  // Same scroll-triggered stagger as StaggerReveal, applied directly to this
  // row's own children — StaggerReveal can't reach them since they're nested
  // one level inside ScrollRow's own scroll container.
  useEffect(() => {
    if (!stagger || reduced || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;

    const items = Array.from(el.children);
    if (items.length === 0) return;

    let trigger: { kill: () => void } | undefined;
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      gsap.set(items, { opacity: 0, y: 20 });
      trigger = gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }).scrollTrigger;
    })();

    return () => trigger?.kill();
  }, [stagger, reduced]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="absolute -left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-raised shadow-[var(--shadow-soft)] press-feedback md:flex"
      >
        <ChevronLeft size={18} />
      </button>
      <div ref={ref} className="flex snap-x gap-5 overflow-x-auto scroll-smooth pb-2" style={{ scrollbarWidth: "thin" }}>
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="absolute -right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-raised shadow-[var(--shadow-soft)] press-feedback md:flex"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
