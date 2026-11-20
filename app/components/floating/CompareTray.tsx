"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCompare } from "../CompareContext";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { useFloatingStack } from "./FloatingStackContext";

interface TourSummary {
  id: string;
  title: string;
  heroImage: string;
}

export default function CompareTray() {
  const { ids, toggle, clear } = useCompare();
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [tours, setTours] = useState<TourSummary[]>([]);
  const { setCompareTrayOpen } = useFloatingStack();

  useEffect(() => {
    if (ids.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears tray state when selection is emptied
      setTours([]);
      setCompareTrayOpen(false);
      return;
    }
    setCompareTrayOpen(true);
    fetch(`/api/compare?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => setTours(data.tours ?? []));
    return () => setCompareTrayOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={reduced ? false : { y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? undefined : { y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-14 z-30 border-t border-border bg-surface-raised px-4 py-3 shadow-[var(--shadow-raised)] md:bottom-0"
        >
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {tours.map((t) => (
                <div key={t.id} className="relative h-12 w-16 overflow-hidden rounded-md border border-border">
                  <Image src={t.heroImage} alt={t.title} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => toggle(t.id)}
                    aria-label={`Remove ${t.title} from compare`}
                    className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/60 text-[10px] text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              <p className="text-sm font-medium">
                {ids.length} tour{ids.length > 1 ? "s" : ""} selected to compare
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/compare?ids=${ids.join(",")}`)}
                className="min-h-11 rounded-full bg-accent px-4 text-sm font-semibold text-white press-feedback"
              >
                Compare
              </button>
              <button type="button" onClick={clear} className="min-h-11 text-sm text-foreground-muted underline">
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
