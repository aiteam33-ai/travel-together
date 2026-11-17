"use client";
import { Page } from "../../components/ui";
import { useT } from "../../lib/AppStateContext";

export default function AboutPage() {
  const t = useT();
  return (
    <Page>
      <h1 className="text-2xl font-bold">{t("aboutTitle")}</h1>
      <p className="text-base">{t("promise")}</p>
      <p className="text-base text-fg-muted">{t("disclaimer")}</p>
    </Page>
  );
}
