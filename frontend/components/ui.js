"use client";
import Link from "next/link";

export function PrimaryButton({ children, onClick, disabled, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[48px] rounded-md bg-black text-white font-medium px-6 py-3 disabled:bg-gray-300 disabled:text-gray-500 ${className}`}
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
      className={`w-full min-h-[48px] rounded-md border border-black text-black font-medium px-6 py-3 disabled:border-gray-300 disabled:text-gray-400 ${className}`}
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
        selected ? "bg-black text-white border-black" : "border-gray-400 text-black"
      }`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ step, total }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" aria-label={`Step ${step} of ${total}`}>
      <div className="h-full bg-black" style={{ width: `${(step / total) * 100}%` }} />
    </div>
  );
}

export function TopLinks({ t }) {
  return (
    <nav className="w-full border-b border-gray-200 px-4 py-4 flex gap-6 text-base">
      <Link href="/chat" className="min-h-[48px] flex items-center">{t("chatLinks")}</Link>
      <Link href="/today" className="min-h-[48px] flex items-center">{t("todayLinks")}</Link>
      <Link href="/plans" className="min-h-[48px] flex items-center">{t("plansLinks")}</Link>
      <Link href="/profile" className="min-h-[48px] flex items-center">{t("profileLinks")}</Link>
    </nav>
  );
}

export function ReadingCard({ t, reading }) {
  return (
    <div className="border border-gray-300 rounded-md p-4 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">{t("chartReason")}</p>
        <p className="text-base">{reading.chartReason}</p>
      </div>
      <div>
        <p className="text-base">{reading.whatItMeans}</p>
      </div>
      <div className="bg-gray-100 rounded-md p-3">
        <p className="text-sm font-semibold text-gray-500 mb-1">{t("nextStep") || "Your one next step"}</p>
        <p className="text-base font-medium">{reading.nextStep}</p>
      </div>
      <p className="text-sm text-gray-500">{t("disclaimer")}</p>
    </div>
  );
}

export function Page({ children }) {
  return <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-4">{children}</main>;
}
