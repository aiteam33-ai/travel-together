import Link from "next/link";

export const metadata = {
  title: "My Socials — plan trips together | Parikrama",
};

export default function MySocialsExplainerPage() {
  return (
    <div className="max-w-3xl">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-accent">My Socials</p>
      <h1 className="font-heading mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
        Plan the trip with your people — not across five apps.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-foreground-muted">
        Group trips usually mean a WhatsApp group, a spreadsheet and a booking site, all disconnected. My Socials
        puts your group&apos;s chat, plan, budget and shared expenses in one connected place.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          { step: "1", title: "Invite your group", body: "Create a group and invite friends by link or mobile number.", href: "/socials#invite" },
          { step: "2", title: "Plan and calculate together", body: "Shortlist tours, chat, vote, and see the group's cost estimate from the same pricing engine used at checkout.", href: "/socials#plan" },
          { step: "3", title: "Book and split expenses", body: "One person books for the group; everyone pays their own share and can record shared expenses.", href: "/socials#book-split" },
        ].map((item) => (
          <Link
            key={item.step}
            href={item.href}
            className="group block rounded-xl border border-border bg-surface p-5 card-hover press-feedback"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{item.step}</span>
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-foreground-muted">{item.body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
              Open in My Socials <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface p-8">
        <h2 className="font-heading text-xl font-bold">What&apos;s inside</h2>
        <p className="mt-1 text-sm text-foreground-muted">Every item below is live inside My Socials — tap one to jump straight in.</p>
        <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          {[
            { label: "Friends, 1:1 messages & group chat", href: "/socials/friends" },
            { label: "Vibe Check + a private secret budget", href: "/socials#plan" },
            { label: "AI Trip Match & side-by-side compare", href: "/compare" },
            { label: "Group voting & quick polls", href: "/socials#plan" },
            { label: "Pay-your-share group booking", href: "/socials#book-split" },
            { label: "Trip countdown & readiness checklist", href: "/socials#plan" },
            { label: "Trek & pilgrimage essentials", href: "/socials#plan" },
            { label: "A Safety Center with SOS", href: "/socials#book-split" },
            { label: "Post-trip memories, reviews & a final expense PDF", href: "/socials#book-split" },
            { label: "Badges & a traveller profile", href: "/account/profile" },
          ].map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="inline-block py-1 text-foreground-muted underline-offset-2 hover:text-accent hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/socials"
        className="mt-8 inline-flex min-h-11 items-center rounded-md bg-accent px-6 text-sm font-semibold text-white press-feedback hover:bg-accent-strong"
      >
        Go to My Socials
      </Link>
    </div>
  );
}
