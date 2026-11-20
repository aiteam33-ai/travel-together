"use client";

import { useCompare } from "./CompareContext";

export default function CompareCheckbox({ tourId }: { tourId: string }) {
  const { isSelected, toggle, atLimit } = useCompare();
  const checked = isSelected(tourId);

  return (
    <label className="mt-2 flex items-center gap-2 text-xs text-foreground-muted">
      <input
        type="checkbox"
        checked={checked}
        disabled={!checked && atLimit}
        onChange={() => toggle(tourId)}
      />
      Compare {!checked && atLimit && "(up to 3)"}
    </label>
  );
}
