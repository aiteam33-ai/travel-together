"use client";

import { useRouter } from "next/navigation";
import { useCompare } from "./CompareContext";

export default function CompareBar() {
  const { ids, clear } = useCompare();
  const router = useRouter();

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border border-border bg-surface px-4 py-2 shadow-xl">
      <div className="flex items-center gap-3 text-sm">
        <span>{ids.length} tour{ids.length > 1 ? "s" : ""} selected to compare</span>
        <button
          type="button"
          onClick={() => router.push(`/compare?ids=${ids.join(",")}`)}
          className="rounded-full bg-accent px-3 py-1 font-semibold text-white"
        >
          Compare
        </button>
        <button type="button" onClick={clear} className="text-foreground-muted underline">
          Clear
        </button>
      </div>
    </div>
  );
}
