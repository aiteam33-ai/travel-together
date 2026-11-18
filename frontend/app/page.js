"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Page, PrimaryButton } from "../components/ui";
import { useAppState, useT } from "../lib/AppStateContext";
import { track } from "../lib/analytics";
import { pickReading } from "../lib/mock/chart";
import { GET_STARTED_MINUTES } from "../lib/config";

const DEMO_BIRTH = { date: "1997-04-10", time: "08:15", place: { name: "Mumbai" } };
const KNOWN_SOURCES = ["instagram", "whatsapp", "youtube"];

export default function Landing() {
  return (
    <Suspense fallback={null}>
      <LandingInner />
    </Suspense>
  );
}

function LandingInner() {
  const t = useT();
  const { state, update, hydrated } = useAppState();
  const searchParams = useSearchParams();
  const demoReading = pickReading(DEMO_BIRTH, t("demoQuestion"));

  useEffect(() => {
    if (!hydrated) return;
    const raw = (searchParams.get("utm_source") || "").toLowerCase();
    const where = KNOWN_SOURCES.includes(raw) ? raw : "other";
    track("landing_viewed", { where });

    if (!state.firstVisitAt) {
      update({ firstVisitAt: new Date().toISOString() });
    } else {
      const days = Math.floor((Date.now() - new Date(state.firstVisitAt).getTime()) / 86400000);
      if (days > 0) track("returned_after_days", { days });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return (
    <Page>
      <h1 className="text-3xl font-bold mt-6">{t("appName")}</h1>
      <p className="text-lg">{t("promise")}</p>
      <p className="text-base text-fg-muted">{t("landingSubline")}</p>
      <div className="flex flex-col gap-2">
        <Link href="/start" onClick={() => track("get_started_clicked")}>
          <PrimaryButton>{t("getFreeReading")}</PrimaryButton>
        </Link>
        <p className="text-sm text-fg-muted text-center whitespace-nowrap overflow-x-auto">
          {t("trustStrip", { minutes: GET_STARTED_MINUTES })}
        </p>
      </div>

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

      <div className="flex flex-col gap-2 mt-2">
        <Link href="/start" onClick={() => track("get_started_clicked")}>
          <PrimaryButton>{t("getFreeReading")}</PrimaryButton>
        </Link>
        <p className="text-sm text-fg-muted text-center whitespace-nowrap overflow-x-auto">
          {t("trustStrip", { minutes: GET_STARTED_MINUTES })}
        </p>
      </div>
      <p className="text-base text-fg-muted mb-8">{t("disclaimer")}</p>
    </Page>
  );
}
