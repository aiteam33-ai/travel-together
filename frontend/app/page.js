"use client";
import Link from "next/link";
import { Page, PrimaryButton } from "../components/ui";
import { useT } from "../lib/AppStateContext";
import { pickReading } from "../lib/mock/chart";

const DEMO_BIRTH = { date: "1997-04-10", time: "08:15", place: { name: "Mumbai" } };

export default function Landing() {
  const t = useT();
  const demoReading = pickReading(DEMO_BIRTH, t("demoQuestion"));

  return (
    <Page>
      <h1 className="text-3xl font-bold mt-6">{t("appName")}</h1>
      <p className="text-lg">{t("promise")}</p>
      <p className="text-base text-fg-muted">{t("landingSubline")}</p>
      <Link href="/start">
        <PrimaryButton>{t("getFreeReading")}</PrimaryButton>
      </Link>

      <div className="mt-4 border border-border rounded-2xl p-4 bg-bg-elevated flex flex-col gap-4">
        <p className="text-sm font-medium">{t("demoQuestion")}</p>
        <div className="flex flex-col gap-2 text-base">
          <p>{demoReading.chartReason}</p>
          <p>{demoReading.whatItMeans}</p>
          <div className="bg-bg rounded-2xl p-4 border border-accent">
            <p className="text-xs font-semibold text-accent mb-2">{t("nextStep")}</p>
            <p className="font-medium">{demoReading.nextStep}</p>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-2 mt-4">
        <h2 className="text-lg font-semibold">{t("whyNotChatgptTitle")}</h2>
        <p className="text-base text-fg-muted">{t("whyNotChatgptBody")}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t("whyNotMarketplaceTitle")}</h2>
        <p className="text-base text-fg-muted">{t("whyNotMarketplaceBody")}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t("dataStaysYoursTitle")}</h2>
        <p className="text-base text-fg-muted">{t("dataStaysYoursBody")}</p>
      </section>

      <Link href="/start" className="mt-2">
        <PrimaryButton>{t("getFreeReading")}</PrimaryButton>
      </Link>
      <p className="text-base text-fg-muted mb-8">{t("disclaimer")}</p>
    </Page>
  );
}
