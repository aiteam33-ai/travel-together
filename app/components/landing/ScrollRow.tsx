"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

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
