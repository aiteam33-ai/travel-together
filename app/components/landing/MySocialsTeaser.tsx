import Link from "next/link";
import RevealOnScroll from "../motion/RevealOnScroll";

const HIGHLIGHTS = [
  { icon: "💬", label: "Group chat" },
  { icon: "🗳️", label: "Quick polls" },
  { icon: "💰", label: "Split expenses" },
  { icon: "🆘", label: "Safety & SOS" },
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

        <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-raised p-4 text-center card-hover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-lg" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-xs font-semibold text-foreground-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </RevealOnScroll>
  );
}
