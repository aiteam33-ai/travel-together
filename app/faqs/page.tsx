const FAQS = [
  { q: "How accurate is the Trip Expense Calculator?", a: "Package cost, GST and TCS are firm figures from our pricing engine. Travel-to-join fares, insurance, visa fees and personal spending are clearly labelled as estimates and may vary." },
  { q: "Is it safe for solo women travellers?", a: "Our women-only departures run with a woman tour manager and all-women local support staff throughout. Check the Women Only tag when browsing." },
  { q: "What if my parents can't walk long distances?", a: "Senior-citizen-tagged departures use fewer hotel changes, shorter drive segments and a slower daily pace." },
  { q: "Do you offer EMI?", a: "Yes — EMI over 3, 6, 9 or 12 months is shown on the calculator and at checkout, with the monthly amount and total interest both shown upfront." },
  { q: "Can I get Jain food on tour?", a: "Most tours support a Jain meal option — check the tour's meal plan, and select it per traveller during checkout." },
  { q: "What happens if I cancel?", a: "Each tour publishes a cancellation fee table by days-before-departure on its detail page; your account shows the exact refund before you confirm a cancellation." },
];

export default function FaqsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">Frequently asked questions</h1>
      <div className="mt-4 space-y-2">
        {FAQS.map((f) => (
          <details key={f.q} className="rounded-lg border border-border bg-surface p-3">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2 text-sm text-foreground-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
