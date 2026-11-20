import { Check } from "lucide-react";
import { formatDateIST, formatRupees } from "@/lib/pricing/format";

const STAGES = [
  { key: "BOOKED", label: "Booked" },
  { key: "DOCUMENTS_RECEIVED", label: "Documents received" },
  { key: "BALANCE_PAID", label: "Balance paid" },
  { key: "VOUCHERS_ISSUED", label: "Vouchers issued" },
  { key: "TRIP_COMPLETED", label: "Trip completed" },
] as const;

const NEXT_STEP_COPY: Record<(typeof STAGES)[number]["key"], string> = {
  BOOKED: "Upload your travel documents so we can move to the next step.",
  DOCUMENTS_RECEIVED: "Pay the balance amount before the due date to confirm your vouchers.",
  BALANCE_PAID: "Nothing needed from you — we're preparing your hotel and transport vouchers.",
  VOUCHERS_ISSUED: "Nothing needed from you — check your email for vouchers before departure.",
  TRIP_COMPLETED: "Your trip is complete. We'd love a review!",
};

export default function BookingTracker({
  trackerStage,
  amountPaid,
  amountDue,
  balanceDueDate,
  documentsNeededNote,
}: {
  trackerStage: string;
  amountPaid: number;
  amountDue: number;
  balanceDueDate: Date | null;
  documentsNeededNote: string | null;
}) {
  const currentIndex = STAGES.findIndex((s) => s.key === trackerStage);

  return (
    <div className="space-y-3">
      <ol aria-label="Booking progress" className="flex items-center">
        {STAGES.map((s, i) => {
          const done = i <= currentIndex;
          return (
            <li key={s.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1 text-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-success text-white" : "border border-border text-foreground-muted"
                  }`}
                >
                  {done ? <Check size={14} /> : i + 1}
                </span>
                <span className="w-20 text-[11px] leading-tight text-foreground-muted">{s.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <span className="mx-1 h-0.5 flex-1 -translate-y-3 rounded-full bg-border">
                  <span className="block h-full rounded-full bg-success transition-[width] duration-300" style={{ width: i < currentIndex ? "100%" : "0%" }} />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="rounded-md bg-surface p-3 text-sm">
        <div className="flex items-center justify-between">
          <span>
            {formatRupees(amountPaid)} paid of {formatRupees(amountDue)}
          </span>
          {balanceDueDate && amountPaid < amountDue && <span className="text-danger">Balance due {formatDateIST(balanceDueDate)}</span>}
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.round((amountPaid / amountDue) * 100))}%` }} />
        </div>
      </div>

      <p className="text-sm text-foreground-muted">
        <strong>What we need from you: </strong>
        {documentsNeededNote ?? NEXT_STEP_COPY[trackerStage as (typeof STAGES)[number]["key"]]}
      </p>
    </div>
  );
}
