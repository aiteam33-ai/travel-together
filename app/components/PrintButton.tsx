"use client";

export default function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-md border border-border px-3 py-1.5 text-sm print:hidden">
      {label}
    </button>
  );
}
