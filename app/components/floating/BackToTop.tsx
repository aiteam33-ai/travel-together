"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useFloatingStack, COMPARE_TRAY_HEIGHT, FLOATING_GAP } from "./FloatingStackContext";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { compareTrayOpen } = useFloatingStack();
  const reduced = usePrefersReducedMotion();
  const extraOffset = compareTrayOpen ? COMPARE_TRAY_HEIGHT + FLOATING_GAP : 0;

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 800);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-[88px] left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground shadow-[var(--shadow-soft)] press-feedback transition-transform duration-200 md:bottom-6 md:left-6 print:hidden"
      style={{ transform: `translateY(-${extraOffset}px)` }}
    >
      <ArrowUp size={18} />
    </button>
  );
}
