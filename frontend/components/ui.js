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

export function DangerButton({ children, onClick, disabled, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[48px] rounded-2xl border border-danger text-danger font-medium px-6 py-4 flex items-center justify-center gap-2 transition-shadow hover:shadow-[0_0_14px_rgba(229,72,77,0.3)] disabled:border-border disabled:text-fg-muted disabled:shadow-none ${className}`}
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

export function Page({ children }) {
  return <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-4">{children}</main>;
}
