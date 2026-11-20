"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

const MENU_ITEMS: { key: string; href: string }[] = [
  { key: "nav.india", href: "/tours?category=DOMESTIC" },
  { key: "nav.world", href: "/tours?category=INTERNATIONAL" },
  { key: "nav.treks", href: "/tours?category=TREK" },
  { key: "nav.speciality", href: "/tours?tag=WOMEN_ONLY" },
  { key: "nav.deals", href: "/tours?sort=price_asc" },
];

const HOVER_OPEN_DELAY = 180;

export default function MegaMenu() {
  const { t } = useLocale();
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  function openOnHover(i: number) {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenIndex(i), HOVER_OPEN_DELAY);
  }

  function cancelHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpenIndex((cur) => (cur === i ? null : i));
    } else if (e.key === "Escape") {
      setOpenIndex(null);
      itemRefs.current[i]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (i + 1) % MENU_ITEMS.length;
      itemRefs.current[next]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
      itemRefs.current[prev]?.focus();
    }
  }

  return (
    <nav
      aria-label="Primary"
      className="hidden flex-1 items-center gap-1 lg:flex"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenIndex(null);
      }}
    >
      {MENU_ITEMS.map((item, i) => {
        const active = pathname === "/tours";
        return (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() => openOnHover(i)}
            onMouseLeave={() => {
              cancelHover();
              setOpenIndex((cur) => (cur === i ? null : cur));
            }}
          >
            <Link
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              href={item.href}
              onClick={() => setOpenIndex(null)}
              onKeyDown={(e) => onKeyDown(e, i)}
              aria-expanded={openIndex === i}
              aria-haspopup="true"
              className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors ${
                active ? "text-accent" : "text-foreground"
              } hover:text-accent`}
            >
              {t(item.key)}
            </Link>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  role="menu"
                  initial={reduced ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-border bg-surface-raised p-2 shadow-[var(--shadow-raised)]"
                >
                  <Link
                    role="menuitem"
                    href={item.href}
                    className="block min-h-11 rounded-md px-3 py-2 text-sm hover:bg-accent-soft"
                    onClick={() => setOpenIndex(null)}
                  >
                    Browse all {t(item.key)}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
