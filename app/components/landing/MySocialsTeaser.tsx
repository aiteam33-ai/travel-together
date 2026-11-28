import Link from "next/link";
import RevealOnScroll from "../motion/RevealOnScroll";
import SpringPopIn from "../animations/SpringPopIn";

const PHONE_CARDS = [
  { icon: "💬", title: "Rohit", text: "Everyone up for the 6am trek start?", tone: "bg-surface" },
  { icon: "🗳️", title: "Poll: departure city", text: "Mumbai — 4 votes · Pune — 2 votes", tone: "bg-accent-soft" },
  { icon: "💰", title: "Split: Hotel Riverside", text: "₹2,400 each · 3 of 5 paid", tone: "bg-surface" },
  { icon: "🆘", title: "Safety check-in", text: "Priya shared her live location", tone: "bg-danger/10" },
];

export default function MySocialsTeaser() {
  return (
    <RevealOnScroll
      as="section"
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent-soft via-surface to-surface p-8 md:p-10"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-accent">My Socials</p>
          <h2 className="font-heading mt-2 text-2xl font-bold md:text-3xl">
            Planning with people? There&apos;s a better way.
          </h2>
          <p className="mt-3 text-foreground-muted">
            Ditch the scattered WhatsApp group and spreadsheet. Chat, vote, split costs and stay safe together —
            all in one place, built around the trip you&apos;re actually booking.
          </p>
          <Link
            href="/my-socials"
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-accent px-6 text-sm font-semibold text-white press-feedback hover:bg-accent-strong"
          >
            Discover My Socials
          </Link>
        </div>

        <div className="mx-auto shrink-0 rounded-[2rem] border-[6px] border-foreground/80 bg-background p-3 shadow-xl" style={{ width: 220 }}>
          <SpringPopIn className="flex flex-col gap-2">
            {PHONE_CARDS.map((card) => (
              <div key={card.title} className={`flex items-start gap-2 rounded-lg ${card.tone} p-2.5 text-left`}>
                <span className="text-base" aria-hidden="true">{card.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{card.title}</p>
                  <p className="truncate text-[11px] text-foreground-muted">{card.text}</p>
                </div>
              </div>
            ))}
          </SpringPopIn>
        </div>
      </div>
    </RevealOnScroll>
  );
}
