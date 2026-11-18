"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export function ReadingCard({ t, reading }) {
  const containerRef = useRef(null);
  const partRefs = useRef([]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const parts = partRefs.current.filter(Boolean);
      if (prefersReduced || parts.length === 0) return;
      gsap.fromTo(
        parts,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.25, ease: "power1.out" },
      );
    },
    { scope: containerRef, dependencies: [] },
  );

  return (
    <div
      ref={containerRef}
      className="border border-border rounded-2xl p-4 flex flex-col gap-4 bg-bg-elevated shadow-[0_0_24px_rgba(232,184,75,0.08)]"
    >
      <div ref={(el) => (partRefs.current[0] = el)}>
        <p className="text-sm font-semibold text-fg-muted mb-2">{t("chartReason")}</p>
        <p className="text-base">{reading.chartReason}</p>
      </div>
      <div ref={(el) => (partRefs.current[1] = el)}>
        <p className="text-base">{reading.whatItMeans}</p>
      </div>
      <div
        ref={(el) => (partRefs.current[2] = el)}
        className="bg-bg rounded-2xl p-4 border border-accent glow-once"
      >
        <p className="text-sm font-semibold text-accent mb-2">{t("nextStep") || "Your one next step"}</p>
        <p className="text-base font-medium">{reading.nextStep}</p>
      </div>
      <p className="text-base text-fg-muted">{t("disclaimer")}</p>
    </div>
  );
}
