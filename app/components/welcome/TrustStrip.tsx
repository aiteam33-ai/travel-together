interface TrustStripProps {
  tourCount: number;
  departureCount: number;
  travellersServed: number;
}

/**
 * Real, live counts (not hardcoded copy) — passed down from
 * getTourCounts() so this never drifts from the actual catalogue.
 */
export default function TrustStrip({ tourCount, departureCount, travellersServed }: TrustStripProps) {
  const items = [
    `${tourCount.toLocaleString("en-IN")} tours`,
    `${departureCount.toLocaleString("en-IN")} upcoming departures`,
    `${travellersServed.toLocaleString("en-IN")}+ seats booked`,
    "Taxes included in every price",
  ];

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-[#FAF6EF]/80">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
