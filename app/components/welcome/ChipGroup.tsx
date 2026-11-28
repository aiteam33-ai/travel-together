"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

export interface ChipOption {
  value: string;
  label: string;
  icon: string; // emoji
}

/**
 * Single-select chip group with full radiogroup/radio semantics and
 * roving-tabindex arrow-key navigation (left/right/up/down all move
 * through the options; Home/End jump to the ends).
 */
export default function ChipGroup({
  legend,
  options,
  value,
  onChange,
  columns = 3,
  variant = "card",
}: {
  legend: string;
  options: ChipOption[];
  value: string | null;
  onChange: (value: string) => void;
  columns?: number;
  variant?: "card" | "pill";
}) {
  const reduced = usePrefersReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusIndex(i: number) {
    const el = refs.current[(i + options.length) % options.length];
    el?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusIndex(i + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusIndex(i - 1);
        break;
      case "Home":
        e.preventDefault();
        focusIndex(0);
        break;
      case "End":
        e.preventDefault();
        focusIndex(options.length - 1);
        break;
    }
  }

  if (variant === "pill") {
    return (
      <div role="radiogroup" aria-label={legend} className="flex flex-wrap justify-center gap-2.5">
        {options.map((opt, i) => {
          const selected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (value === null && i === 0) ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => onChange(opt.value)}
              whileHover={reduced ? undefined : { y: -2 }}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-welcome-accent ${
                selected
                  ? "border-welcome-accent bg-welcome-accent text-welcome-primary"
                  : "border-white/20 bg-white/10 text-welcome-text hover:border-white/40 hover:bg-white/15"
              }`}
            >
              {opt.icon} {opt.label}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={legend}>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((opt, i) => {
          const selected = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (value === null && i === 0) ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => onChange(opt.value)}
              whileHover={reduced ? undefined : { y: -3 }}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              className={`relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center backdrop-blur-md transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-welcome-accent ${
                selected
                  ? "border-welcome-accent bg-welcome-accent text-welcome-primary"
                  : "border-white/20 bg-white/10 text-welcome-text hover:border-white/40 hover:bg-white/15"
              }`}
            >
              {selected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-welcome-primary text-welcome-accent">
                  <Check size={12} strokeWidth={3} aria-hidden="true" />
                </span>
              )}
              <span className="text-2xl" aria-hidden="true">{opt.icon}</span>
              <span className="text-sm font-semibold">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
