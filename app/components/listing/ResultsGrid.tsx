"use client";

import { motion, LayoutGroup } from "framer-motion";
import TourCard from "../TourCard";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

interface ResultItem {
  tourId: string;
  slug: string;
  title: string;
  heroImage: string;
  durationDays: number;
  durationNights: number;
  cheapestPricePerPerson: number | null;
  nextDates: string[];
}

export default function ResultsGrid({ results }: { results: ResultItem[] }) {
  const reduced = usePrefersReducedMotion();

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((r, i) => (
          <motion.div
            key={r.tourId}
            layout={!reduced}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: reduced ? 0 : Math.min(i, 8) * 0.04 }}
          >
            <TourCard
              tourId={r.tourId}
              slug={r.slug}
              title={r.title}
              heroImage={r.heroImage}
              durationDays={r.durationDays}
              durationNights={r.durationNights}
              cheapestPricePerPerson={r.cheapestPricePerPerson}
              nextDates={r.nextDates.map((d) => new Date(d))}
            />
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  );
}
