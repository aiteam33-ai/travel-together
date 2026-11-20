import { prisma } from "@/lib/db/client";
import TaxConfigForm from "@/app/components/admin/TaxConfigForm";

export default async function AdminPricingPage() {
  const [taxConfigs, pricingConfigs, emiConfigs] = await Promise.all([
    prisma.taxConfig.findMany({ orderBy: { effectiveFrom: "desc" } }),
    prisma.pricingConfig.findMany({ orderBy: { effectiveFrom: "desc" } }),
    prisma.emiConfig.findMany({ orderBy: { months: "asc" } }),
  ]);

  const latestByKey = new Map<string, (typeof taxConfigs)[number]>();
  for (const c of taxConfigs) if (!latestByKey.has(c.key)) latestByKey.set(c.key, c);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Pricing &amp; tax configuration</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Changes here take effect immediately on the calculator, tour price panel and checkout — they all read
          from this same configuration.
        </p>
      </div>

      <section>
        <h2 className="font-semibold">Tax rates</h2>
        <p className="text-xs text-foreground-muted">Confirm these rates with your accountant before relying on them.</p>
        <TaxConfigForm configs={Array.from(latestByKey.values())} />
      </section>

      <section>
        <h2 className="font-semibold">Personal spending presets &amp; estimates (₹, from most recent config)</h2>
        <table className="mt-2 w-full max-w-xl text-sm">
          <tbody>
            {pricingConfigs
              .filter((p, i, arr) => arr.findIndex((x) => x.key === p.key) === i)
              .map((p) => (
                <tr key={p.key} className="border-t border-border">
                  <td className="py-1">{p.key}</td>
                  <td>{p.key.includes("RATE") ? p.value : `₹${(p.value / 100).toLocaleString("en-IN")}`}</td>
                  <td className="text-xs text-foreground-muted">{p.note}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-semibold">EMI configuration</h2>
        <table className="mt-2 w-full max-w-md text-sm">
          <thead><tr className="text-left"><th>Months</th><th>Annual interest rate</th></tr></thead>
          <tbody>
            {emiConfigs.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="py-1">{e.months}</td>
                <td>{e.annualInterestRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
