import TourImage from "@/app/components/TourImage";
import { notFound } from "next/navigation";
import { getTourBySlug, parseJsonField } from "@/lib/data/tours";
import TripCostCalculator from "@/app/components/pricing/TripCostCalculator";
import TourPricePanel from "@/app/components/tour/TourPricePanel";
import SectionChips from "@/app/components/tour/SectionChips";
import WishlistButton from "@/app/components/WishlistButton";
import SeatsBar from "@/app/components/tour/SeatsBar";
import { formatDateIST } from "@/lib/pricing/format";

interface ItineraryDay { day: number; title: string; description: string }
interface Hotel { city: string; name: string; rating: number }
interface Faq { q: string; a: string }
interface CancellationRule { daysBefore: number; feePercent: number }

export default async function TourDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ groupId?: string }> }) {
  const { slug } = await params;
  const { groupId } = await searchParams;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const itinerary = parseJsonField<ItineraryDay[]>(tour.itinerary, []);
  const inclusions = parseJsonField<string[]>(tour.inclusions, []);
  const exclusions = parseJsonField<string[]>(tour.exclusions, []);
  const hotels = parseJsonField<Hotel[]>(tour.hotels, []);
  const faqs = parseJsonField<Faq[]>(tour.faqs, []);
  const cancellation = parseJsonField<CancellationRule[]>(tour.cancellationPolicy, []);
  const documentsNeeded = parseJsonField<string[]>(tour.documentsNeeded, []);
  const gallery = tour.gallery.split(",");
  const gearList = tour.gearList ? parseJsonField<string[]>(tour.gearList, []) : [];

  const futureDepartures = tour.departures
    .filter((d) => d.startDate >= new Date())
    .map((d) => ({ id: d.id, startDate: d.startDate.toISOString(), seatsLeft: d.totalSeats - d.seatsBooked, totalSeats: d.totalSeats }));

  return (
    <div>
      <SectionChips />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-10">
        <div id="overview">
          <div className="grid grid-cols-3 gap-2">
            <TourImage
              src={tour.heroImage}
              alt={`${tour.title}, ${tour.durationDays}-day tour`}
              aspect="fill"
              containerClassName="col-span-2 h-80 overflow-hidden rounded-xl"
              imageClassName="object-cover"
              priority
            />
            <div className="flex flex-col gap-2">
              {gallery.slice(0, 2).map((g, i) => (
                <TourImage
                  key={i}
                  src={g}
                  alt={`${tour.title}, view ${i + 1}`}
                  aspect="fill"
                  containerClassName="h-[9.5rem] overflow-hidden rounded-xl"
                  imageClassName="object-cover"
                />
              ))}
            </div>
          </div>
          <h1 className="font-heading mt-4 text-3xl font-bold">{tour.title}</h1>
          <p className="mt-1 text-foreground-muted">{tour.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-border px-3 py-1">{tour.durationDays} days / {tour.durationNights} nights</span>
            <span className="rounded-full border border-border px-3 py-1">{tour.category}</span>
            {tour.tags.split(",").map((tag) => (
              <span key={tag} className="rounded-full border border-border px-3 py-1">{tag.replace(/_/g, " ")}</span>
            ))}
            <WishlistButton tourId={tour.id} />
          </div>
          {futureDepartures[0] && <SeatsBar seatsLeft={futureDepartures[0].seatsLeft} totalSeats={futureDepartures[0].totalSeats} />}
        </div>

        {tour.difficulty && (
          <section aria-labelledby="trek-info" className="rounded-xl border border-border bg-surface p-5">
            <h2 id="trek-info" className="font-heading text-xl font-bold">Trek details</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
              <div><dt className="font-semibold">Difficulty</dt><dd>{tour.difficulty}</dd></div>
              <div><dt className="font-semibold">Max altitude</dt><dd>{tour.altitudeMeters} m</dd></div>
              <div><dt className="font-semibold">Fitness requirement</dt><dd>{tour.fitnessNote}</dd></div>
            </dl>
            {gearList.length > 0 && (
              <>
                <h3 className="mt-3 font-semibold">Gear list</h3>
                <ul className="mt-1 list-disc pl-5 text-sm">{gearList.map((g) => <li key={g}>{g}</li>)}</ul>
              </>
            )}
          </section>
        )}

        <section id="itinerary" aria-labelledby="itinerary-heading">
          <h2 id="itinerary-heading" className="font-heading text-xl font-bold">Day-wise itinerary</h2>
          <ol className="mt-3 space-y-3">
            {itinerary.map((d) => (
              <li key={d.day} className="rounded-lg border border-border bg-surface p-4">
                <p className="font-semibold">Day {d.day}: {d.title}</p>
                <p className="mt-1 text-sm text-foreground-muted">{d.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <div id="inclusions" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <section>
            <h2 className="font-heading text-xl font-bold">Inclusions</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{inclusions.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold">Exclusions</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{exclusions.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        </div>

        <section id="hotels">
          <h2 className="font-heading text-xl font-bold">Hotels</h2>
          <ul className="mt-2 space-y-1 text-sm">{hotels.map((h) => <li key={h.name}>{h.city}: {h.name} ({h.rating}★, indicative)</li>)}</ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold">Documents needed</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{documentsNeeded.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>

        <section id="policies" aria-labelledby="cancellation-heading">
          <h2 id="cancellation-heading" className="font-heading text-xl font-bold">Cancellation policy</h2>
          <table className="mt-2 w-full text-sm">
            <thead><tr className="text-left"><th className="py-1">Cancelled before departure</th><th>Fee</th></tr></thead>
            <tbody>
              {cancellation.map((c) => (
                <tr key={c.daysBefore} className="border-t border-border">
                  <td className="py-1">{c.daysBefore} days or more</td>
                  <td>{c.feePercent}% of package cost</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-heading text-xl font-bold">FAQs</h2>
          <div className="mt-2 space-y-2">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-lg border border-border bg-surface p-3">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm text-foreground-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {tour.reviews.length > 0 && (
          <section id="reviews" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="font-heading text-xl font-bold">Reviews</h2>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tour.reviews.map((r) => {
                const photos: string[] = r.photos ? JSON.parse(r.photos) : [];
                return (
                  <div key={r.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
                    <p>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                    <p className="mt-1">{r.text}</p>
                    {photos.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto">
                        {photos.map((url, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={url} alt="Review photo" className="h-20 w-20 shrink-0 rounded-md object-cover" />
                        ))}
                      </div>
                    )}
                    <p className="mt-2 font-semibold">
                      {r.name} {r.verifiedBooking && <span className="ml-1 rounded bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success">Verified booking</span>}
                    </p>
                    <p className="text-xs text-foreground-muted">{formatDateIST(r.travelDate)}{r.isSampleData ? " · Sample review" : ""}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section id="full-calculator" aria-labelledby="full-calc-heading">
          <h2 id="full-calc-heading" className="font-heading text-xl font-bold">Full trip cost breakdown</h2>
          {futureDepartures.length > 0 ? (
            <div className="mt-4">
              <TripCostCalculator tourId={tour.id} isInternational={tour.isInternational} departures={futureDepartures} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-foreground-muted">No upcoming departures right now — please check back soon or enquire.</p>
          )}
        </section>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-[150px]">
        <TourPricePanel tourId={tour.id} tourTitle={tour.title} isInternational={tour.isInternational} departures={futureDepartures} groupId={groupId} />
      </aside>
      </div>
    </div>
  );
}
