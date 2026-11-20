import Link from "next/link";
import Image from "next/image";
import { formatRupees, formatDateIST } from "@/lib/pricing/format";

interface TourCardProps {
  slug: string;
  title: string;
  heroImage: string;
  durationDays: number;
  durationNights: number;
  cheapestPricePerPerson: number | null; // paise
  nextDates: Date[];
  seatsLeft?: number;
}

export default function TourCard({ slug, title, heroImage, durationDays, durationNights, cheapestPricePerPerson, nextDates, seatsLeft }: TourCardProps) {
  const emiFrom = cheapestPricePerPerson ? Math.round(cheapestPricePerPerson / 100 / 6) : null;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:shadow-md">
      <Link href={`/tours/${slug}`} className="block">
        <div className="relative h-44 w-full">
          <Image src={heroImage} alt={`${title} — illustrative placeholder photo`} fill className="object-cover" />
        </div>
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
            Next dates: {nextDates.slice(0, 3).map((d) => formatDateIST(d)).join(", ")}
          </p>
        )}
        <div className="mt-auto">
          {cheapestPricePerPerson ? (
            <>
              <p className="text-lg font-bold">{formatRupees(cheapestPricePerPerson)} <span className="text-xs font-normal text-foreground-muted">per person, twin sharing</span></p>
              {emiFrom && <p className="text-xs text-foreground-muted">EMI from ₹{emiFrom.toLocaleString("en-IN")}/mo</p>}
            </>
          ) : (
            <p className="text-sm text-foreground-muted">No upcoming departures</p>
          )}
        </div>
        <Link
          href={`/tours/${slug}`}
          className="mt-2 inline-block rounded-md bg-accent px-3 py-2 text-center text-sm font-semibold text-white hover:bg-accent-strong"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
