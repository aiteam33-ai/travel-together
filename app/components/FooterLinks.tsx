"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function FooterCompanyLinks() {
  const { t } = useLocale();
  return (
    <div>
      <h3 className="font-semibold">{t("footer.company")}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        <li><Link href="/about">{t("footer.about")}</Link></li>
        <li><Link href="/branches">{t("footer.branches")}</Link></li>
        <li><Link href="/blog">{t("footer.blog")}</Link></li>
        <li><Link href="/contact">{t("footer.contact")}</Link></li>
      </ul>
    </div>
  );
}

export function FooterPolicyLinks() {
  const { t } = useLocale();
  return (
    <div>
      <h3 className="font-semibold">{t("footer.policies")}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        <li><Link href="/policies/cancellation">{t("footer.cancellation")}</Link></li>
        <li><Link href="/policies/privacy">{t("footer.privacy")}</Link></li>
        <li><Link href="/policies/terms">{t("footer.terms")}</Link></li>
        <li><Link href="/faqs">{t("footer.faqs")}</Link></li>
      </ul>
    </div>
  );
}

export function FooterBranchesHeading() {
  const { t } = useLocale();
  return <h3 className="font-semibold">{t("footer.branchesHeading")}</h3>;
}
