// Sticker-style badge (Phase 2 visual identity) — a slightly rotated,
// drop-shadowed pill meant to read as "stuck on" the card, not a flat label.
export default function StickerBadge({
  children,
  tone = "accent",
  className,
}: {
  children: React.ReactNode;
  tone?: "accent" | "danger";
  className?: string;
}) {
  const toneClass =
    tone === "danger" ? "bg-danger text-white" : "bg-accent text-white";

  return (
    <span
      className={`badge-pop inline-flex -rotate-3 items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-raised ${toneClass} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
