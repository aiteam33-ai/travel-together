"use client";

import { formatRupees } from "@/lib/pricing/format";
import RollingNumber from "./RollingNumber";
import type { PricingEngineOutput } from "@/lib/pricing/types";

export default function PriceBreakdown({ output }: { output: PricingEngineOutput }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="mb-1 font-semibold">Paid to us</h3>
        <ul className="space-y-1">
          {output.paidToUs.map((l, i) => (
            <li key={i} className="flex justify-between">
              <span>{l.label}{l.isEstimate && <span className="ml-1 text-xs text-foreground-muted">(estimate)</span>}</span>
              <span>{formatRupees(l.amount)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-border pt-1 font-semibold">
            <span>Subtotal</span>
            <span>{formatRupees(output.paidToUsSubtotal)}</span>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">Taxes</h3>
        <ul className="space-y-1">
          {output.taxes.map((l, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span>{l.label}</span>
              <span className="shrink-0">{formatRupees(l.amount)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-border pt-1 font-semibold">
            <span>Taxes subtotal</span>
            <span>{formatRupees(output.taxesSubtotal)}</span>
          </li>
        </ul>
      </div>

      <div className="rounded-md bg-accent/10 p-3">
        <div className="flex justify-between text-base font-bold">
          <span>Grand total (paid to us + taxes)</span>
          <RollingNumber value={output.grandTotal} />
        </div>
        <p className="mt-1 text-xs text-foreground-muted">
          {formatRupees(output.costPerPerson)} per person · {formatRupees(output.costPerDay)} per day
        </p>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">Your own spending (estimate)</h3>
        <ul className="space-y-1">
          {output.ownSpending.map((l, i) => (
            <li key={i} className="flex justify-between">
              <span>{l.label}</span>
              <span>{formatRupees(l.amount)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-foreground-muted">
          We do not charge for this — it is your own estimated spending, kept separate from the grand total above.
        </p>
      </div>

      <div className="flex justify-between rounded-md border border-border p-3 text-sm">
        <div>
          <p className="font-semibold">Due now</p>
          <p>{formatRupees(output.amountDueNow)}</p>
        </div>
        <div>
          <p className="font-semibold">Due later</p>
          <p>{formatRupees(output.amountDueLater)}</p>
        </div>
      </div>

      {output.foreignCurrencyEquivalent && (
        <p className="text-xs text-foreground-muted">
          ≈ {output.foreignCurrencyEquivalent.code} {output.foreignCurrencyEquivalent.amount.toLocaleString()} at the configured reference rate (estimate only).
        </p>
      )}

      <div>
        <h3 className="mb-1 font-semibold">EMI options</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-foreground-muted">
              <th>Months</th><th>Monthly</th><th>Total interest</th>
            </tr>
          </thead>
          <tbody>
            {output.emiOptions.map((e) => (
              <tr key={e.months}>
                <td>{e.months}</td>
                <td>{formatRupees(e.monthlyAmount)}</td>
                <td>{formatRupees(e.totalInterest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
