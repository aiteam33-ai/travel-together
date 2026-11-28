"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { DEPARTURE_CITIES, DEPARTURE_CITY_LABELS, DepartureCityCode } from "@/lib/pricing/constants";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "../auth/AuthContext";
import { useWishlist } from "../WishlistContext";
import { useCompare } from "../CompareContext";
import { useSocials } from "../SocialsContext";
import MegaMenu from "./MegaMenu";
import Breadcrumbs from "./Breadcrumbs";
import ThemeToggle from "../ThemeToggle";

export default function Header() {
  const { t, locale, setLocale } = useLocale();
  const { user, loading } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { ids: compareIds } = useCompare();
  const { unreadCount } = useSocials();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  // A page that requires login redirects here with ?login=1&next=<path> instead
  // of silently bouncing the visitor to "/" — this opens the login dialog
  // automatically and sends them on to where they were trying to go once they
  // sign in. The lazy initializer covers a fresh page load; the effect below
  // covers navigating here via an already-mounted Header (Header lives in the
  // root layout and never remounts on client-side navigation, so a *later*
  // redirect to ?login=1 would otherwise never be noticed).
  const [loginOpen, setLoginOpen] = useState(() => searchParams.get("login") === "1");

  useEffect(() => {
    if (searchParams.get("login") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to an external URL change, not derived render state
      setLoginOpen(true);
    }
  }, [searchParams]);
  const [city, setCity] = useState<DepartureCityCode>("MUMBAI");
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      setCondensed(y > 80);
      // Hide while scrolling down past the header's own height (so it
      // doesn't flicker right at the top), show again on any upward scroll —
      // the standard "give the page room, but never make nav hard to find"
      // pattern.
      if (y > lastY && y > 120) setHidden(true);
      else if (y < lastY) setHidden(false);
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Other sticky bars positioned just below the header (e.g. the tour detail
  // page's section tabs) read these off <html>: --header-h to sit exactly
  // under the header (its height varies with breadcrumbs, the condensed
  // state and screen width, so no fixed px offset fits), and .header-hidden
  // to slide up into its spot while it's hidden instead of leaving a gap.
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("header-hidden", hidden);
  }, [hidden]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 border-b border-border/70 bg-surface/80 backdrop-blur-lg print:hidden transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
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

          <ThemeToggle />

          <Link href="/account/wishlist" className="relative hidden min-h-11 min-w-11 items-center justify-center rounded-md lg:flex" aria-label="Wishlist">
            <span aria-hidden="true">♡</span>
            {wishlistCount > 0 && (
              <span className="badge-pop absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {user && (
            <Link href="/socials" className="relative hidden min-h-11 items-center rounded-md px-2 text-sm font-medium lg:flex" aria-label="My Socials">
              My Socials
              {unreadCount > 0 && (
                <span className="badge-pop absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          <Link
            href={compareIds.length > 0 ? `/compare?ids=${compareIds.join(",")}` : "/compare"}
            className="relative hidden min-h-11 min-w-11 items-center justify-center rounded-md lg:flex"
            aria-label="Compare"
          >
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
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={nextPath ? () => window.location.assign(nextPath) : undefined}
        />
      )}
    </header>
  );
}
