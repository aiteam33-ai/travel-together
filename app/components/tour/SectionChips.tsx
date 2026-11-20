"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "full-calculator", label: "Dates & prices" },
  { id: "inclusions", label: "Inclusions" },
  { id: "hotels", label: "Hotels" },
  { id: "policies", label: "Policies" },
  { id: "reviews", label: "Reviews" },
];

export default function SectionChips() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const ready = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!ready.current) {
          ready.current = true;
          return;
        }
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav aria-label="Tour sections" className="sticky top-[73px] z-20 -mx-6 overflow-x-auto border-b border-border bg-surface/95 px-6 py-2 backdrop-blur lg:top-[88px]">
      <ul className="flex gap-2">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => scrollToSection(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors press-feedback ${
                active === s.id ? "bg-accent text-white" : "border border-border text-foreground-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
