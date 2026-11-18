"use client";
import Link from "next/link";

export function PrimaryButton({ children, onClick, disabled, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[48px] rounded-2xl bg-accent text-bg font-medium px-6 py-4 transition-shadow hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] disabled:bg-bg-elevated disabled:text-fg-muted disabled:shadow-none ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, disabled, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[48px] rounded-2xl border border-accent text-fg font-medium px-6 py-4 transition-shadow hover:shadow-[0_0_14px_rgba(232,184,75,0.25)] disabled:border-border disabled:text-fg-muted disabled:shadow-none ${className}`}
    >
      {children}
    </button>
  );
}

export function Chip({ children, onClick, selected = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[48px] px-4 rounded-full border text-base ${
        selected ? "bg-accent text-bg border-accent" : "border-border text-fg"
      }`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ step, total }) {
  return (
    <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden" aria-label={`Step ${step} of ${total}`}>
      <div className="h-full bg-accent" style={{ width: `${(step / total) * 100}%` }} />
    </div>
  );
}

export function TopLinks({ t }) {
  return (
    <nav className="w-full border-b border-border px-4 py-4 flex gap-6 text-base">
      <Link href="/chat" className="min-h-[48px] flex items-center">{t("chatLinks")}</Link>
      <Link href="/today" className="min-h-[48px] flex items-center">{t("todayLinks")}</Link>
      <Link href="/plans" className="min-h-[48px] flex items-center">{t("plansLinks")}</Link>
      <Link href="/profile" className="min-h-[48px] flex items-center">{t("profileLinks")}</Link>
    </nav>
  );
}

export function ReadingCard({ t, reading }) {
  return (
    <div className="border border-border rounded-2xl p-4 flex flex-col gap-4 bg-bg-elevated shadow-[0_0_24px_rgba(232,184,75,0.08)]">
      <div>
        <p className="text-sm font-semibold text-fg-muted mb-2">{t("chartReason")}</p>
        <p className="text-base">{reading.chartReason}</p>
      </div>
      <div>
        <p className="text-base">{reading.whatItMeans}</p>
      </div>
      <div className="bg-bg rounded-2xl p-4 border border-accent glow-once">
        <p className="text-sm font-semibold text-accent mb-2">{t("nextStep") || "Your one next step"}</p>
        <p className="text-base font-medium">{reading.nextStep}</p>
      </div>
      <p className="text-base text-fg-muted">{t("disclaimer")}</p>
    </div>
  );
}

export function Page({ children }) {
  return <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-4">{children}</main>;
}
