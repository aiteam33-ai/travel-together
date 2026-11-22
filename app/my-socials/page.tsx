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
          { step: "1", title: "Invite your group", body: "Create a group and invite friends by link or mobile number." },
          { step: "2", title: "Plan and calculate together", body: "Shortlist tours, chat, vote, and see the group's cost estimate from the same pricing engine used at checkout." },
          { step: "3", title: "Book and split expenses", body: "One person books for the group; everyone pays their own share and can record shared expenses." },
        ].map((item) => (
          <div key={item.step} className="rounded-xl border border-border bg-surface p-5 card-hover">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">{item.step}</span>
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-foreground-muted">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface p-8">
        <h2 className="font-heading text-xl font-bold">What&apos;s inside</h2>
        <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm text-foreground-muted sm:grid-cols-2">
          <li>Friends, 1:1 messages &amp; group chat</li>
          <li>Vibe Check + a private secret budget</li>
          <li>AI Trip Match &amp; side-by-side compare</li>
          <li>Group voting &amp; quick polls</li>
          <li>Pay-your-share group booking</li>
          <li>Trip countdown &amp; readiness checklist</li>
          <li>Trek &amp; pilgrimage essentials</li>
          <li>A Safety Center with SOS</li>
          <li>Post-trip memories, reviews &amp; a final expense PDF</li>
          <li>Badges &amp; a traveller profile</li>
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
