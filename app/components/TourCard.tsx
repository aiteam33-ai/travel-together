"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupees, formatDateIST } from "@/lib/pricing/format";
import CompareCheckbox from "./CompareCheckbox";
import { useLocale } from "@/lib/i18n/LocaleContext";
import TiltImage from "./motion/TiltImage";
import TourImage from "./TourImage";
import StickerBadge from "./StickerBadge";

export interface DepartureOption {
  id: string;
  startDate: Date;
  seatsLeft: number;
}

interface TourCardProps {
  tourId: string;
  slug: string;
  title: string;
  heroImage: string;
  durationDays: number;
  durationNights: number;
  cheapestPricePerPerson: number | null; // paise
  nextDates: Date[];
  seatsLeft?: number;
  /** When a tour has multiple upcoming low-seat departures, render them as
   * selectable date chips on one card instead of one card per departure. */
  departureOptions?: DepartureOption[];
}

export default function TourCard({
  tourId,
  slug,
  title,
  heroImage,
  durationDays,
  durationNights,
  cheapestPricePerPerson,
  nextDates,
  seatsLeft,
  departureOptions,
}: TourCardProps) {
  const { t } = useLocale();
  const emiFrom = cheapestPricePerPerson ? Math.round(cheapestPricePerPerson / 100 / 6) : null;
  const [selectedDeparture, setSelectedDeparture] = useState(0);
  const activeSeatsLeft = departureOptions ? departureOptions[selectedDeparture]?.seatsLeft : seatsLeft;

  return (
    <article className="card-hover flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <Link href={`/tours/${slug}`} className="relative block overflow-hidden">
        <TiltImage className="relative overflow-hidden">
          <TourImage src={heroImage} alt={`${title}, ${durationDays}-day tour`} />
        </TiltImage>
        {activeSeatsLeft !== undefined && activeSeatsLeft <= 8 && (
          <div className="soft-pulse absolute left-3 top-3 z-10">
            <StickerBadge tone="danger">Only {activeSeatsLeft} left</StickerBadge>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/tours/${slug}`} className="font-heading text-base font-bold leading-snug hover:text-accent">
          {title}
        </Link>
        <p className="text-sm text-foreground-muted">{durationDays} days / {durationNights} nights</p>

        {departureOptions && departureOptions.length > 1 ? (
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Departure date">
            {departureOptions.slice(0, 4).map((d, i) => (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={selectedDeparture === i}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedDeparture(i);
                }}
                className={`min-h-8 rounded-md border px-2 text-xs font-medium transition-colors ${
                  selectedDeparture === i
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-border text-foreground-muted hover:border-accent"
                }`}
              >
                {formatDateIST(d.startDate)}
              </button>
            ))}
          </div>
        ) : (
          nextDates.length > 0 && (
            <p className="text-xs text-foreground-muted">
              {t("card.nextDates")}: {nextDates.slice(0, 3).map((d) => formatDateIST(d)).join(", ")}
            </p>
          )
        )}

        <div className="mt-auto">
          {cheapestPricePerPerson ? (
            <>
              <p className="text-lg font-bold">{formatRupees(cheapestPricePerPerson)} <span className="text-xs font-normal text-foreground-muted">{t("price.perPerson")}</span></p>
              {emiFrom && <p className="text-xs text-foreground-muted">{t("price.emiFrom")} ₹{emiFrom.toLocaleString("en-IN")}/mo</p>}
            </>
          ) : (
            <p className="text-sm text-foreground-muted">{t("card.noDepartures")}</p>
          )}
        </div>
        <Link
          href={`/tours/${slug}${departureOptions ? `?departureId=${departureOptions[selectedDeparture].id}` : ""}`}
          className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-accent px-3 text-center text-sm font-semibold text-white press-feedback hover:bg-accent-strong"
        >
          {t("card.viewDetails")}
        </Link>
        <CompareCheckbox tourId={tourId} />
      </div>
    </article>
  );
}
