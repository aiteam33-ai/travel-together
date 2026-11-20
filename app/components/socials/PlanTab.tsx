"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShortlistItem {
  id: string;
  tourId: string;
  tourTitle: string;
  tourSlug: string;
  addedByName: string;
  selected: boolean;
}

export default function PlanTab({ groupId, isOrganiser, shortlist }: { groupId: string; isOrganiser: boolean; shortlist: ShortlistItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function select(itemId: string) {
    setBusyId(itemId);
    await fetch(`/api/groups/${groupId}/shortlist/${itemId}/select`, { method: "POST" });
    setBusyId(null);
    router.refresh();
  }

  async function shareInChat(item: ShortlistItem) {
    setBusyId(item.id);
    await fetch(`/api/groups/${groupId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: item.tourTitle, messageKind: "PACKAGE", attachmentTourId: item.tourId }),
    });
    setBusyId(null);
  }

  return (
    <div>
      <p className="text-sm text-foreground-muted">
        Any member can add a tour here from its tour page (&ldquo;Plan this with your group&rdquo;). The organiser
        picks one as the trip&apos;s selected tour.
      </p>
      {shortlist.length === 0 ? (
        <p className="mt-4 text-sm text-foreground-muted">
          No tours shortlisted yet. <Link href="/tours" className="underline">Browse tours</Link> and add one.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {shortlist.map((item) => (
            <li key={item.id} className={`flex items-center justify-between rounded-md border p-3 text-sm ${item.selected ? "border-accent bg-accent-soft" : "border-border bg-surface"}`}>
              <div>
                <Link href={`/tours/${item.tourSlug}`} className="font-semibold hover:text-accent">{item.tourTitle}</Link>
                <p className="text-xs text-foreground-muted">Added by {item.addedByName}{item.selected && " · Selected"}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busyId === item.id} onClick={() => shareInChat(item)} className="min-h-11 rounded-md border border-border px-3 text-xs font-semibold press-feedback">
                  Share in chat
                </button>
                {isOrganiser && !item.selected && (
                  <button type="button" disabled={busyId === item.id} onClick={() => select(item.id)} className="min-h-11 rounded-md border border-border px-3 text-xs font-semibold press-feedback">
                    Select this tour
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
