import { Suspense } from "react";
import CompareClient from "@/app/components/CompareClient";

export default function ComparePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Compare tours</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Same travellers, same departure city, applied to every tour below — so the comparison is fair.
      </p>
      <Suspense fallback={<p className="mt-4 text-sm text-foreground-muted">Loading…</p>}>
        <CompareClient />
      </Suspense>
    </div>
  );
}
