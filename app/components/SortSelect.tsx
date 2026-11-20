"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set("sort", e.target.value);
    else params.delete("sort");
    router.push(`/tours?${params.toString()}`);
  }

  return (
    <label className="text-sm">
      Sort by{" "}
      <select defaultValue={searchParams.get("sort") ?? ""} onChange={onChange} className="rounded-md border border-border bg-background px-2 py-1.5">
        <option value="">Relevance</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="duration">Duration</option>
      </select>
    </label>
  );
}
