"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TripCostCalculator from "../pricing/TripCostCalculator";
import EnquireButton from "../EnquireButton";
import SlideOverPanel from "../SlideOverPanel";
import AddToGroupButton from "../socials/AddToGroupButton";
import { formatRupees, formatDateIST } from "@/lib/pricing/format";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";
import { useFloatingStack, COMPARE_TRAY_HEIGHT, FLOATING_GAP } from "../floating/FloatingStackContext";
import type { PricingEngineOutput } from "@/lib/pricing/types";

interface DepartureOption {
  id: string;
  startDate: string;
  seatsLeft: number;
}

/**
 * Owns the compact calculator's live output so the booking bar (Stage 3.3)
 * can mirror it with real figures, and tracks whether the panel's own Book
 * button is on screen.
 */
export default function TourPricePanel({
  tourId,
  tourTitle,
  isInternational,
  departures,
}: {
  tourId: string;
  tourTitle: string;
  isInternational: boolean;
  departures: DepartureOption[];
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [output, setOutput] = useState<PricingEngineOutput | null>(null);
  const [adults, setAdults] = useState(2);
  const [departureId, setDepartureId] = useState(departures[0]?.id ?? "");
  const bookButtonRef = useRef<HTMLAnchorElement>(null);
  const [bookButtonVisible, setBookButtonVisible] = useState(true);
  const reduced = usePrefersReducedMotion();
  const { compareTrayOpen } = useFloatingStack();
  const extraOffset = compareTrayOpen ? COMPARE_TRAY_HEIGHT + FLOATING_GAP : 0;

  useEffect(() => {
    if (!bookButtonRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setBookButtonVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(bookButtonRef.current);
    return () => observer.disconnect();
  }, []);

  const departure = departures.find((d) => d.id === departureId);

  return (
    <>
      <div className="rounded-xl border border-border bg-surface p-4">
        {departures.length > 0 ? (
          <TripCostCalculator
            tourId={tourId}
            isInternational={isInternational}
            departures={departures}
            compact
            onStateChange={(state) => {
              setOutput(state.output);
              setAdults(state.adults);
              setDepartureId(state.departureId);
            }}
          />
        ) : (
          <p className="text-sm text-foreground-muted">No upcoming departures right now.</p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <a
            ref={bookButtonRef}
            href={`/checkout/new?departureId=${departureId}`}
            className="flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-center font-semibold text-white press-feedback hover:bg-accent-strong"
          >
            Book now
          </a>
          <EnquireButton tourId={tourId} tourTitle={tourTitle} />
          <AddToGroupButton tourId={tourId} />
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="min-h-11 text-sm font-medium text-accent underline press-feedback"
          >
            See full cost breakdown
          </button>
        </div>
      </div>

      <SlideOverPanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Full trip cost breakdown">
        {departures.length > 0 && (
          <TripCostCalculator tourId={tourId} isInternational={isInternational} departures={departures} />
        )}
      </SlideOverPanel>

      <AnimatePresence>
        {!bookButtonVisible && output && departure && (
          <motion.div
            initial={reduced ? false : { y: 80, opacity: 0 }}
            animate={{ y: -extraOffset, opacity: 1 }}
            exit={reduced ? undefined : { y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-14 z-30 border-t border-border bg-surface-raised px-4 py-3 shadow-[var(--shadow-raised)] md:bottom-0"
          >
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {formatDateIST(departure.startDate)} · {adults} adult{adults > 1 ? "s" : ""} · <strong>{formatRupees(output.grandTotal)}</strong>
              </p>
              <a
                href={`/checkout/new?departureId=${departureId}`}
                className="flex min-h-11 items-center rounded-md bg-accent px-4 text-sm font-semibold text-white press-feedback"
              >
                Book now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
