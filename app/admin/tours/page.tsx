import { prisma } from "@/lib/db/client";
import { formatDateIST, formatRupees } from "@/lib/pricing/format";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    include: { departures: { include: { cityPrices: true } } },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Tours &amp; departures</h1>
      <div className="mt-4 space-y-4">
        {tours.map((t) => (
          <details key={t.id} className="rounded-xl border border-border bg-surface p-3">
            <summary className="cursor-pointer font-semibold">
              {t.title} — {t.departures.length} departures
            </summary>
            <table className="mt-2 w-full text-sm">
              <thead><tr className="text-left"><th>Start date</th><th>Seats</th><th>Mumbai price</th></tr></thead>
              <tbody>
                {t.departures.map((d) => {
                  const mumbai = d.cityPrices.find((c) => c.city === "MUMBAI");
                  return (
                    <tr key={d.id} className="border-t border-border">
                      <td className="py-1">{formatDateIST(d.startDate)}</td>
                      <td>{d.seatsBooked}/{d.totalSeats}</td>
                      <td>{mumbai ? formatRupees(mumbai.pricePerPerson) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </details>
        ))}
      </div>
    </div>
  );
}
