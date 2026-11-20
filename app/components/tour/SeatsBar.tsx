const FILLING_FAST_THRESHOLD = 8; // seats left — admin-configurable in a later iteration

export default function SeatsBar({ seatsLeft, totalSeats }: { seatsLeft: number; totalSeats: number }) {
  const percentLeft = Math.max(0, Math.min(100, Math.round((seatsLeft / totalSeats) * 100)));
  const fillingFast = seatsLeft <= FILLING_FAST_THRESHOLD;

  return (
    <div className="mt-2 max-w-xs">
      <div className="flex items-center justify-between text-xs">
        <span className={fillingFast ? "font-semibold text-danger" : "text-foreground-muted"}>
          {seatsLeft} of {totalSeats} seats left{fillingFast && " · Filling fast"}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fillingFast ? "bg-danger" : "bg-accent"}`}
          style={{ width: `${percentLeft}%` }}
        />
      </div>
    </div>
  );
}
