import { formatRupees } from "@/lib/pricing/format";
import type { PricingEngineOutput } from "@/lib/pricing/types";

export default function GroupSavingBar({ groupDiscount }: { groupDiscount: PricingEngineOutput["groupDiscount"] }) {
  if (groupDiscount.applied) {
    return (
      <p className="rounded-md bg-success-soft px-3 py-2 text-sm font-medium text-success" role="status">
        ✓ Group saving applied — {formatRupees(groupDiscount.perPersonAmount)} off per person
      </p>
    );
  }

  if (groupDiscount.travellersToNextTier && groupDiscount.nextTierDiscountPerPerson) {
    return (
      <p className="rounded-md bg-accent-soft px-3 py-2 text-sm font-medium text-accent-strong" role="status">
        Add {groupDiscount.travellersToNextTier} more traveller{groupDiscount.travellersToNextTier > 1 ? "s" : ""} to save{" "}
        {formatRupees(groupDiscount.nextTierDiscountPerPerson)} per person
      </p>
    );
  }

  return null;
}
