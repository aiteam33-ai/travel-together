"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS, DepartureCityCode } from "@/lib/pricing/constants";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "../auth/AuthContext";
import { useWishlist } from "../WishlistContext";
import { useCompare } from "../CompareContext";
import MegaMenu from "./MegaMenu";
import Breadcrumbs from "./Breadcrumbs";

export default function Header() {
  const { t, locale, setLocale } = useLocale();
  const { user, loading } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { ids: compareIds } = useCompare();
  const [loginOpen, setLoginOpen] = useState(false);
  const [city, setCity] = useState<DepartureCityCode>("MUMBAI");
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    function onScroll() {
      setCondensed(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div
        className={`mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 transition-[padding] duration-200 ${
          condensed ? "py-2" : "py-3"
        }`}
      >
        <Link href="/" className="font-heading text-xl font-bold text-accent" lang="en">
          {BRAND.shortName}
        </Link>

        <MegaMenu />

        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-1 text-sm lg:flex">
            <span className="sr-only">{t("search.city")}</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as DepartureCityCode)}
              className="min-h-11 rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
            >
              {DEPARTURE_CITIES.map((c) => (
                <option key={c} value={c}>{DEPARTURE_CITY_LABELS[c]}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "hi" : "en")}
            className="min-h-11 rounded-md border border-border px-2 text-sm font-medium press-feedback"
            aria-label="Switch language"
          >
            {locale === "en" ? "हिंदी" : "English"}
          </button>

          <a href={`tel:${BRAND.supportPhone.replace(/\s/g, "")}`} className="hidden text-sm font-medium lg:inline">
            {BRAND.supportPhone}
          </a>

          <Link href="/account/wishlist" className="relative hidden min-h-11 min-w-11 items-center justify-center rounded-md lg:flex" aria-label="Wishlist">
            <span aria-hidden="true">♡</span>
            {wishlistCount > 0 && (
              <span className="badge-pop absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/compare" className="relative hidden min-h-11 min-w-11 items-center justify-center rounded-md lg:flex" aria-label="Compare">
            <span aria-hidden="true">⇄</span>
            {compareIds.length > 0 && (
              <span className="badge-pop absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                {compareIds.length}
              </span>
            )}
          </Link>

          {loading ? null : user ? (
            <Link href="/account" className="min-h-11 rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white press-feedback hover:bg-accent-strong flex items-center">
              {t("nav.account")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="min-h-11 rounded-md bg-accent px-3 text-sm font-semibold text-white press-feedback hover:bg-accent-strong"
            >
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
      <Breadcrumbs />
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </header>
  );
}
