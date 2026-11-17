"use client";
import { Page } from "../../components/ui";
import { useT } from "../../lib/AppStateContext";

export default function AboutPage() {
  const t = useT();
  return (
    <Page>
      <h1 className="text-2xl font-bold">{t("aboutTitle")}</h1>
      <p className="text-base">{t("promise")}</p>

      <section className="border border-border rounded-2xl p-4 bg-bg-elevated flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t("fullDisclaimerTitle")}</h2>
        <p className="text-base text-fg-muted">{t("fullDisclaimerBody")}</p>
      </section>

      <a href="tel:14416" className="text-base underline">
        {t("needHelp")}
      </a>
    </Page>
  );
}
