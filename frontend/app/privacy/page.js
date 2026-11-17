"use client";
import { Page } from "../../components/ui";
import { useT } from "../../lib/AppStateContext";

export default function PrivacyPage() {
  const t = useT();
  return (
    <Page>
      <h1 className="text-2xl font-bold">{t("privacyTitle")}</h1>
      <p className="text-base">{t("consentWhat")}</p>
      <p className="text-base">{t("consentWhy")}</p>
      <p className="text-base">{t("consentShare")}</p>
      <p className="text-base">{t("consentDelete")}</p>
      <p className="text-sm text-fg-muted">support@astroguide.example</p>
    </Page>
  );
}
