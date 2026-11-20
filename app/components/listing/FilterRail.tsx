"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import { TOUR_CATEGORIES, TRAVELLER_TAGS, MEAL_PLAN_TYPES } from "@/lib/pricing/constants";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

interface SearchParams {
  destination?: string;
  category?: string;
  tag?: string;
  minBudget?: string;
  maxBudget?: string;
  durationMin?: string;
  durationMax?: string;
  mealPlan?: string;
  sort?: string;
}

function buildHref(sp: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...sp, ...overrides };
  const params = new URLSearchParams();
  Object.entries(merged).forEach(([k, v]) => {
    if (v) params.set(k, v as string);
  });
  return `/tours?${params.toString()}`;
}

function FilterContent({ sp, onNavigate }: { sp: SearchParams; onNavigate?: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-semibold">Category</h2>
        <ul className="space-y-1 text-sm">
          <li><Link onClick={onNavigate} className={`block min-h-11 py-1.5 ${!sp.category ? "font-bold text-accent" : ""}`} href={buildHref(sp, { category: undefined })}>All</Link></li>
          {TOUR_CATEGORIES.map((c) => (
            <li key={c}>
              <Link onClick={onNavigate} className={`block min-h-11 py-1.5 ${sp.category === c ? "font-bold text-accent" : ""}`} href={buildHref(sp, { category: c })}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="mb-2 font-semibold">Traveller type</h2>
        <ul className="space-y-1 text-sm">
          {TRAVELLER_TAGS.map((tag) => (
            <li key={tag}>
              <Link onClick={onNavigate} className={`block min-h-11 py-1.5 ${sp.tag === tag ? "font-bold text-accent" : ""}`} href={buildHref(sp, { tag })}>
                {tag.replace(/_/g, " ")}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="mb-2 font-semibold">Meal plan</h2>
        <ul className="space-y-1 text-sm">
          {MEAL_PLAN_TYPES.map((m) => (
            <li key={m}>
              <Link onClick={onNavigate} className={`block min-h-11 py-1.5 ${sp.mealPlan === m ? "font-bold text-accent" : ""}`} href={buildHref(sp, { mealPlan: m })}>
                {m.replace(/_/g, "-")}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <form action="/tours" method="get" className="space-y-2">
        <h2 className="font-semibold">Budget (₹ per person)</h2>
        <input name="minBudget" defaultValue={sp.minBudget} placeholder="Min" className="min-h-11 w-full rounded-md border border-border bg-background px-2 text-sm" />
        <input name="maxBudget" defaultValue={sp.maxBudget} placeholder="Max" className="min-h-11 w-full rounded-md border border-border bg-background px-2 text-sm" />
        <h2 className="font-semibold">Duration (days)</h2>
        <input name="durationMin" defaultValue={sp.durationMin} placeholder="Min" className="min-h-11 w-full rounded-md border border-border bg-background px-2 text-sm" />
        <input name="durationMax" defaultValue={sp.durationMax} placeholder="Max" className="min-h-11 w-full rounded-md border border-border bg-background px-2 text-sm" />
        <button type="submit" className="min-h-11 w-full rounded-md bg-accent text-sm font-semibold text-white press-feedback">Apply</button>
      </form>
    </div>
  );
}

export default function FilterRail({ sp }: { sp: SearchParams }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  return (
    <>
      <aside aria-label="Filters" className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
        <FilterContent sp={sp} />
      </aside>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="flex min-h-11 items-center gap-2 self-start rounded-md border border-border px-4 text-sm font-semibold press-feedback lg:hidden"
      >
        <SlidersHorizontal size={16} /> Filters
      </button>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={reduced ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduced ? undefined : { y: "100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-lg bg-surface-raised p-4 lg:hidden"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold">Filters</h2>
                <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close filters" className="flex min-h-11 min-w-11 items-center justify-center">
                  <X size={20} />
                </button>
              </div>
              <FilterContent sp={sp} onNavigate={() => setSheetOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
