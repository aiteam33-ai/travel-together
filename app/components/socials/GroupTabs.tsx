"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "plan", label: "Plan" },
  { key: "expenses", label: "Expenses" },
  { key: "members", label: "Members" },
];

export default function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Group sections" className="flex gap-2 border-b border-border">
      {TABS.map((tab) => {
        const href = `/socials/${groupId}/${tab.key}`;
        const active = pathname === href || (tab.key === "overview" && pathname === `/socials/${groupId}`);
        return (
          <Link
            key={tab.key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center border-b-2 px-3 text-sm font-medium ${
              active ? "border-accent text-accent" : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
