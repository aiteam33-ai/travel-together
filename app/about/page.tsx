import { BRAND } from "@/lib/brand";

export default function AboutPage() {
  return (
    <article className="prose max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">About {BRAND.name}</h1>
      <p className="mt-4 text-foreground-muted">
        {BRAND.name} plans fixed-departure group tours, customised holidays and Himalayan treks across India and
        abroad. We built this site around one idea: a family planning a big trip should see the whole cost — not
        just a &ldquo;starts from&rdquo; number — before they ever need to call a branch.
      </p>
      <p className="mt-4 text-foreground-muted">
        Every tour on this site declares its meal plan, its cancellation terms, and its day-wise itinerary up front.
        Our Trip Expense Calculator breaks down what you pay us, what tax applies, and what you&apos;re likely to spend
        yourself — kept clearly separate — so the number you plan around is the number you actually pay.
      </p>
    </article>
  );
}
