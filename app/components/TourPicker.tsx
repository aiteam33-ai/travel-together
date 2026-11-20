"use client";

export default function TourPicker({ tours, selectedSlug }: { tours: { slug: string; title: string }[]; selectedSlug: string }) {
  return (
    <form method="get" className="mt-4 max-w-md">
      <label className="block text-sm font-medium">
        Tour
        <select
          name="tourSlug"
          defaultValue={selectedSlug}
          onChange={(e) => e.currentTarget.form?.submit()}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
        >
          {tours.map((t) => (
            <option key={t.slug} value={t.slug}>{t.title}</option>
          ))}
        </select>
      </label>
    </form>
  );
}
