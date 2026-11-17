"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppState, useT } from "../lib/AppStateContext";

const TABS = [
  { href: "/chat", key: "chatLinks", icon: "💬" },
  { href: "/today", key: "todayLinks", icon: "☀️" },
  { href: "/plans", key: "plansLinks", icon: "💳" },
  { href: "/profile", key: "profileLinks", icon: "👤" },
];

export function AppShell({ children }) {
  const { state } = useAppState();
  const t = useT();
  const pathname = usePathname();

  const [todayKey, setTodayKey] = useState(null);
  useEffect(() => {
    // Reads the client's current date (an external system), once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayKey(new Date().toISOString().slice(0, 10));
  }, []);
  const todayUnread = todayKey && state.openQuestion && state.todaySeenDate !== todayKey;

  return (
    <>
      <header className="w-full border-b border-border px-4 py-4 flex items-center justify-between md:hidden">
        <span className="text-lg font-semibold">{t("appName")}</span>
        <Link href="/privacy" aria-label={t("privacyTitle")} className="min-h-[48px] min-w-[48px] flex items-center justify-center">
          🔒
        </Link>
      </header>

      <nav className="hidden md:flex w-full border-b border-border px-4 py-4 gap-6 items-center">
        <span className="text-lg font-semibold mr-4">{t("appName")}</span>
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`min-h-[48px] flex items-center gap-2 relative ${
              pathname === tab.href ? "text-accent" : "text-fg"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {t(tab.key)}
            {tab.href === "/today" && todayUnread && (
              <span className="w-2 h-2 rounded-full bg-accent" aria-label="unread" />
            )}
          </Link>
        ))}
        <Link href="/privacy" aria-label={t("privacyTitle")} className="min-h-[48px] flex items-center ml-auto">
          🔒
        </Link>
      </nav>

      <div className="pb-24 md:pb-0 flex-1 flex flex-col">{children}</div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-bg flex">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 min-h-[64px] flex flex-col items-center justify-center gap-1 relative ${
              pathname === tab.href ? "text-accent" : "text-fg-muted"
            }`}
          >
            <span className="text-xl" aria-hidden="true">{tab.icon}</span>
            <span className="text-sm">{t(tab.key)}</span>
            {tab.href === "/today" && todayUnread && (
              <span className="absolute top-2 right-[calc(50%-20px)] w-2 h-2 rounded-full bg-accent" aria-label="unread" />
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}
