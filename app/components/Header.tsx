"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { DEPARTURE_CITY_LABELS, DEPARTURE_CITIES, DepartureCityCode } from "@/lib/pricing/constants";
import LoginModal from "./auth/LoginModal";
import { useAuth } from "./auth/AuthContext";

const MEGA_MENU: { key: string; href: string }[] = [
  { key: "nav.india", href: "/tours?category=DOMESTIC" },
  { key: "nav.world", href: "/tours?category=INTERNATIONAL" },
  { key: "nav.treks", href: "/tours?category=TREK" },
  { key: "nav.speciality", href: "/tours?tag=WOMEN_ONLY" },
  { key: "nav.deals", href: "/tours?sort=price_asc" },
];

export default function Header() {
  const { t, locale, setLocale } = useLocale();
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [city, setCity] = useState<DepartureCityCode>("MUMBAI");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="font-heading text-xl font-bold text-accent">
          {BRAND.shortName}
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 items-center gap-6 lg:flex">
          {MEGA_MENU.map((item) => (
            <Link key={item.key} href={item.href} className="text-sm font-medium text-foreground hover:text-accent">
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-1 text-sm md:flex">
            <span className="sr-only">{t("search.city")}</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as DepartureCityCode)}
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
            >
              {DEPARTURE_CITIES.map((c) => (
                <option key={c} value={c}>{DEPARTURE_CITY_LABELS[c]}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "hi" : "en")}
            className="rounded-md border border-border px-2 py-1.5 text-sm font-medium"
            aria-label="Switch language"
          >
            {locale === "en" ? "हिंदी" : "English"}
          </button>

          <a href={`tel:${BRAND.supportPhone.replace(/\s/g, "")}`} className="hidden text-sm font-medium md:inline">
            {BRAND.supportPhone}
          </a>

          {loading ? null : user ? (
            <Link href="/account" className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-strong">
              {t("nav.account")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-strong"
            >
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </header>
  );
}
