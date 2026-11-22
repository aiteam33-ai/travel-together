import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { getTourCounts, getFastFillingDepartures } from "@/lib/data/tours";
import TourCard from "./components/TourCard";
import SearchBar from "./components/SearchBar";
import ScrollRow from "./components/landing/ScrollRow";
import LandingIntro from "./components/landing/LandingIntro";
import RevealOnScroll from "./components/motion/RevealOnScroll";
import StaggerReveal from "./components/motion/StaggerReveal";
import CountUp from "./components/motion/CountUp";
import { formatRupees, formatDateIST } from "@/lib/pricing/format";
import { TRAVELLER_TAGS, DEPARTURE_CITIES, DEPARTURE_CITY_LABELS } from "@/lib/pricing/constants";

export default async function HomePage() {
  const [{ tourCount, departureCount, travellersServed }, fastFilling, reviews] = await Promise.all([
    getTourCounts(),
    getFastFillingDepartures(6),
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { tour: true } }),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <LandingIntro>
        <section className="rounded-2xl bg-gradient-to-br from-accent/10 to-transparent p-8 md:p-14">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-accent" data-intro="headline">Travel, together</p>
          <h1 className="font-heading mt-2 max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl" data-intro="headline">
            Plan, book and share the trip with your people.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-foreground-muted" data-intro="headline">
            Search fixed-departure tours, treks and pilgrimages across India and the world, see the full door-to-door
            cost with our Trip Expense Calculator — and with My Socials, plan it together with the friends or family
            you&apos;re travelling with.
          </p>
          <div className="mt-8" data-intro="search">
            <SearchBar />
          </div>
        </section>
      </LandingIntro>

      {fastFilling.length > 0 && (
        <RevealOnScroll as="section">
          <h2 className="font-heading mb-4 text-2xl font-bold">Departures filling fast</h2>
          <ScrollRow>
            {fastFilling.map((d) => (
              <div key={d.id} className="w-72 shrink-0 snap-start">
                <TourCard
                  tourId={d.tour.id}
                  slug={d.tour.slug}
                  title={d.tour.title}
                  heroImage={d.tour.heroImage}
                  durationDays={d.tour.durationDays}
                  durationNights={d.tour.durationNights}
                  cheapestPricePerPerson={d.basePricePerPerson}
                  nextDates={[d.startDate]}
                  seatsLeft={d.seatsLeft}
                />
              </div>
            ))}
          </ScrollRow>
        </RevealOnScroll>
      )}

      <section>
        <h2 className="font-heading mb-4 text-2xl font-bold">Browse by traveller type</h2>
        <StaggerReveal as="div" className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {TRAVELLER_TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/tours?tag=${tag}`}
              className="flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface p-4 text-center text-sm font-semibold press-feedback hover:border-accent hover:text-accent"
            >
              {tag.replace(/_/g, " ")}
            </Link>
          ))}
        </StaggerReveal>
      </section>

      <section>
        <h2 className="font-heading mb-4 text-2xl font-bold">Browse by departure city</h2>
        <StaggerReveal as="div" className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {DEPARTURE_CITIES.filter((c) => c !== "JOIN_AT_DESTINATION").map((city) => (
            <Link
              key={city}
              href={`/tours?city=${city}`}
              className="flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface p-4 text-center text-sm font-semibold press-feedback hover:border-accent hover:text-accent"
            >
              {DEPARTURE_CITY_LABELS[city]}
            </Link>
          ))}
        </StaggerReveal>
      </section>

      <RevealOnScroll as="section" className="rounded-2xl border border-border bg-surface p-8">
        <h2 className="font-heading text-2xl font-bold">Trip Expense Calculator</h2>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          Most &ldquo;starts from&rdquo; prices grow once you call. Ours doesn&apos;t have to — add your travellers, your
          departure city and your add-ons, and see the real total, taxes and your own estimated spending, split out
          clearly, before you book.
        </p>
        <Link href="/trip-cost-calculator" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-semibold text-white press-feedback hover:bg-accent-strong">
          Try the calculator
        </Link>
      </RevealOnScroll>

      <section>
        <h2 className="font-heading mb-4 text-2xl font-bold">Why travel with us</h2>
        <StaggerReveal as="div" className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { q: "Is it safe for solo women travellers?", a: "Our women-only departures carry a woman tour manager and all-women local support staff, start to finish." },
            { q: "What if my parents can't walk long distances?", a: "Senior-citizen departures use fewer hotel changes, shorter drive segments, and a slower daily pace." },
            { q: "Why does the price look higher than an ad I saw?", a: "Our price panel and calculator show the full door-to-door cost up front, including taxes — not just a joining fare." },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-border bg-surface p-5 card-hover">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-foreground-muted">{item.a}</p>
            </div>
          ))}
        </StaggerReveal>
      </section>

      {reviews.length > 0 && (
        <section>
          <h2 className="font-heading mb-4 text-2xl font-bold">What travellers say</h2>
          <StaggerReveal as="div" className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-surface p-5 card-hover">
                <p className="text-sm">{r.text}</p>
                <p className="mt-3 text-sm font-semibold">
                  {r.name} {r.verifiedBooking && <span className="ml-1 rounded bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success">Verified booking</span>}
                </p>
                <p className="text-xs text-foreground-muted">{r.tour.title} · {formatDateIST(r.travelDate)}{r.isSampleData ? " · Sample review" : ""}</p>
              </div>
            ))}
          </StaggerReveal>
        </section>
      )}

      <RevealOnScroll as="section" className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-foreground-muted">
          <span><CountUp value={tourCount} className="font-heading text-2xl font-extrabold text-accent" /> tours</span>
          <span aria-hidden="true">·</span>
          <span><CountUp value={departureCount} className="font-heading text-2xl font-extrabold text-accent" /> upcoming departures</span>
          <span aria-hidden="true">·</span>
          <span><CountUp value={travellersServed} suffix="+" className="font-heading text-2xl font-extrabold text-accent" /> seats booked by travellers so far</span>
        </p>
      </RevealOnScroll>
    </div>
  );
}
