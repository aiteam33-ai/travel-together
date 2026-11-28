import Link from "next/link";
import {
  Users, Heart, Armchair, Sparkles, Landmark, Mountain,
  Snowflake, Waves, Sunrise, Sunset, TreePine, Building2, Palmtree,
  ShieldCheck, Accessibility, Calculator, Star, MapPin, CalendarCheck,
} from "lucide-react";
import { prisma } from "@/lib/db/client";
import { getTourCounts, getFastFillingDeparturesByTour, getFeaturedInternationalTours } from "@/lib/data/tours";
import TourCard from "./components/TourCard";
import ScrollRow from "./components/landing/ScrollRow";
import LandingIntro from "./components/landing/LandingIntro";
import WelcomeHero from "./components/landing/WelcomeHero";
import MySocialsTeaser from "./components/landing/MySocialsTeaser";
import RevealOnScroll from "./components/motion/RevealOnScroll";
import StaggerReveal from "./components/motion/StaggerReveal";
import CountUp from "./components/motion/CountUp";
import Marquee from "./components/animations/Marquee";
import ScrollWordHighlight from "./components/animations/ScrollWordHighlight";
import { formatDateIST } from "@/lib/pricing/format";
import { TRAVELLER_TAGS, DEPARTURE_CITIES, DEPARTURE_CITY_LABELS, INDIA_REGIONS, INDIA_REGION_LABELS, TravellerTag, IndiaRegion } from "@/lib/pricing/constants";

// Statically generated (no per-request DB round-trip) but revalidated every
// 60s — seat counts and "filling fast" departures shown here are live
// inventory, so this can't be frozen at build time forever like a pure
// marketing page; ISR keeps it fast while staying reasonably fresh.
export const revalidate = 60;

const TRAVELLER_TAG_ICONS: Record<TravellerTag, React.ElementType> = {
  FAMILY: Users,
  HONEYMOON: Heart,
  SENIOR_CITIZENS: Armchair,
  WOMEN_ONLY: Sparkles,
  PILGRIMAGE: Landmark,
  TREK: Mountain,
};

const REGION_ICONS: Record<IndiaRegion, React.ElementType> = {
  NORTH: Snowflake,
  SOUTH: Waves,
  EAST: Sunrise,
  WEST: Sunset,
  NORTHEAST: TreePine,
  CENTRAL: Building2,
  ISLANDS: Palmtree,
};

export default async function HomePage() {
  const [{ tourCount, departureCount, travellersServed }, fastFilling, worldTours, reviews] = await Promise.all([
    getTourCounts(),
    getFastFillingDeparturesByTour(6, false),
    getFeaturedInternationalTours(6),
    // Sample/seeded reviews are never shown publicly — only real, submitted
    // reviews. See the "What travellers say" section below for the empty state.
    prisma.review.findMany({ where: { isSampleData: false }, orderBy: { createdAt: "desc" }, take: 6, include: { tour: true } }),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <LandingIntro>
        <WelcomeHero />
      </LandingIntro>

      {fastFilling.length > 0 && (
        <RevealOnScroll as="section">
          <h2 className="font-heading mb-4 text-2xl font-bold">Departures filling fast</h2>
          <ScrollRow stagger>
            {fastFilling.map(({ tour, departures }) => (
              <div key={tour.id} className="w-72 shrink-0 snap-start">
                <TourCard
                  tourId={tour.id}
                  slug={tour.slug}
                  title={tour.title}
                  heroImage={tour.heroImage}
                  durationDays={tour.durationDays}
                  durationNights={tour.durationNights}
                  cheapestPricePerPerson={departures[0].basePricePerPerson}
                  nextDates={departures.map((d) => d.startDate)}
                  departureOptions={departures.map((d) => ({ id: d.id, startDate: d.startDate, seatsLeft: d.seatsLeft }))}
                />
              </div>
            ))}
          </ScrollRow>
        </RevealOnScroll>
      )}

      {worldTours.length > 0 && (
        <RevealOnScroll as="section">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold">Explore the world</h2>
            <Link href="/destinations" className="text-sm font-semibold text-accent hover:underline">See all destinations</Link>
          </div>
          <Marquee durationSeconds={38}>
            {worldTours.map(({ tour, futureDepartures, cheapestPricePerPerson }) => (
              <div key={tour.id} className="w-72 shrink-0">
                <TourCard
                  tourId={tour.id}
                  slug={tour.slug}
                  title={tour.title}
                  heroImage={tour.heroImage}
                  durationDays={tour.durationDays}
                  durationNights={tour.durationNights}
                  cheapestPricePerPerson={cheapestPricePerPerson}
                  nextDates={futureDepartures.slice(0, 3).map((d) => d.startDate)}
                />
              </div>
            ))}
          </Marquee>
        </RevealOnScroll>
      )}

      <MySocialsTeaser />

      <section>
        <h2 className="font-heading mb-4 text-2xl font-bold">Browse by traveller type</h2>
        <StaggerReveal as="div" className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {TRAVELLER_TAGS.map((tag) => {
            const Icon = TRAVELLER_TAG_ICONS[tag];
            return (
              <Link
                key={tag}
                href={`/tours?tag=${tag}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center card-hover press-feedback"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold">{tag.replace(/_/g, " ")}</span>
              </Link>
            );
          })}
        </StaggerReveal>
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-soft via-surface to-surface p-6 md:p-8">
        <h2 className="font-heading mb-1 text-2xl font-bold">Browse India by region</h2>
        <p className="mb-4 text-sm text-foreground-muted">Every tour on Parikrama is somewhere in India — pick a region to start.</p>
        <StaggerReveal as="div" className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {INDIA_REGIONS.map((region) => {
            const Icon = REGION_ICONS[region];
            return (
              <Link
                key={region}
                href={`/tours?region=${region}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-raised p-4 text-center card-hover press-feedback"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold">{INDIA_REGION_LABELS[region]}</span>
              </Link>
            );
          })}
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

      <RevealOnScroll as="section" className="relative overflow-hidden rounded-2xl bg-accent p-8 text-white">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <Calculator size={22} aria-hidden="true" />
            </span>
            <h2 className="font-heading mt-3 text-2xl font-bold">Trip Expense Calculator</h2>
            <ScrollWordHighlight
              className="mt-2 text-white/90"
              text={
                "Most “starts from” prices grow once you call. Ours doesn't have to — add your travellers, your departure city and your add-ons, and see the real total, taxes and your own estimated spending, split out clearly, before you book."
              }
            />
          </div>
          <Link
            href="/trip-cost-calculator"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-white px-6 font-semibold text-accent-strong press-feedback hover:bg-white/90"
          >
            Try the calculator
          </Link>
        </div>
      </RevealOnScroll>

      <section>
        <h2 className="font-heading mb-4 text-2xl font-bold">Why travel with us</h2>
        <StaggerReveal as="div" className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { icon: ShieldCheck, q: "Is it safe for solo women travellers?", a: "Our women-only departures carry a woman tour manager and all-women local support staff, start to finish." },
            { icon: Accessibility, q: "What if my parents can't walk long distances?", a: "Senior-citizen departures use fewer hotel changes, shorter drive segments, and a slower daily pace." },
            { icon: Calculator, q: "Why does the price look higher than an ad I saw?", a: "Our price panel and calculator show the full door-to-door cost up front, including taxes — not just a joining fare." },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-border bg-surface p-5 card-hover">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <item.icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-foreground-muted">{item.a}</p>
            </div>
          ))}
        </StaggerReveal>
      </section>

      <section>
        <h2 className="font-heading mb-4 text-2xl font-bold">What travellers say</h2>
        {reviews.length > 0 ? (
          <ScrollRow>
            {reviews.map((r) => (
              <div key={r.id} className="w-80 shrink-0 snap-start rounded-xl border border-border bg-surface p-5 card-hover">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {r.name} {r.verifiedBooking && <span className="ml-1 rounded bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success">Verified booking</span>}
                    </p>
                    <div className="flex items-center gap-0.5 text-accent" aria-hidden="true">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} fill="currentColor" strokeWidth={0} />)}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm">{r.text}</p>
                <p className="mt-2 text-xs text-foreground-muted">{r.tour.title} · {formatDateIST(r.travelDate)}</p>
              </div>
            ))}
          </ScrollRow>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
            <p className="font-semibold">No traveller reviews yet</p>
            <p className="mt-1 text-sm text-foreground-muted">Be the first to book and share how your trip went.</p>
          </div>
        )}
      </section>

      <RevealOnScroll as="section" className="rounded-2xl border border-border bg-surface p-8">
        <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
          {[
            { icon: MapPin, value: tourCount, suffix: "", label: "tours" },
            { icon: CalendarCheck, value: departureCount, suffix: "", label: "upcoming departures" },
            { icon: Users, value: travellersServed, suffix: "+", label: "seats booked by travellers so far" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                <stat.icon size={22} aria-hidden="true" />
              </span>
              <CountUp value={stat.value} suffix={stat.suffix} className="font-heading text-3xl font-extrabold text-accent" />
              <span className="text-sm text-foreground-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </div>
  );
}
