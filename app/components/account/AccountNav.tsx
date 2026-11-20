"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function AccountNav({ userName }: { userName: string | null }) {
  const { t } = useLocale();
  return (
    <nav aria-label="Account" className="space-y-1 text-sm">
      <p className="mb-2 font-semibold">Hi, {userName ?? "there"}</p>
      <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/bookings">{t("account.bookings")}</Link>
      <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/wishlist">{t("account.wishlist")}</Link>
      <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/calculations">{t("account.calculations")}</Link>
      <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/travellers">{t("account.travellers")}</Link>
      <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/support">{t("account.support")}</Link>
      <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/profile">{t("account.profile")}</Link>
    </nav>
  );
}
