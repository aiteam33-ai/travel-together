"use client";

import Link from "next/link";
import Image from "next/image";
import { formatRupees, formatDateIST } from "@/lib/pricing/format";
import CompareCheckbox from "./CompareCheckbox";
import { useLocale } from "@/lib/i18n/LocaleContext";
import TiltImage from "./motion/TiltImage";

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
}

export default function TourCard({ tourId, slug, title, heroImage, durationDays, durationNights, cheapestPricePerPerson, nextDates, seatsLeft }: TourCardProps) {
  const { t } = useLocale();
  const emiFrom = cheapestPricePerPerson ? Math.round(cheapestPricePerPerson / 100 / 6) : null;
  return (
    <article className="card-hover flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <Link href={`/tours/${slug}`} className="block overflow-hidden">
        <TiltImage className="relative h-44 w-full overflow-hidden">
          <Image src={heroImage} alt={`${title} — illustrative placeholder photo`} fill className="card-hover-image object-cover" />
        </TiltImage>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/tours/${slug}`} className="font-heading text-base font-bold leading-snug hover:text-accent">
          {title}
        </Link>
        <p className="text-sm text-foreground-muted">{durationDays} days / {durationNights} nights</p>
        {seatsLeft !== undefined && seatsLeft <= 8 && (
          <p className="text-sm font-semibold text-danger">Only {seatsLeft} seats left</p>
        )}
        {nextDates.length > 0 && (
          <p className="text-xs text-foreground-muted">
            {t("card.nextDates")}: {nextDates.slice(0, 3).map((d) => formatDateIST(d)).join(", ")}
          </p>
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
          href={`/tours/${slug}`}
          className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-accent px-3 text-center text-sm font-semibold text-white press-feedback hover:bg-accent-strong"
        >
          {t("card.viewDetails")}
        </Link>
        <CompareCheckbox tourId={tourId} />
      </div>
    </article>
  );
}
