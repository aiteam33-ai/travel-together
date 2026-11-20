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
        {results.map((r) => (
          <motion.div key={r.tourId} layout={!reduced} transition={{ duration: 0.25 }}>
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
