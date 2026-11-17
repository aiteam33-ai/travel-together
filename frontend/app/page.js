"use client";
import Link from "next/link";
import { Page, PrimaryButton } from "../components/ui";
import { useT } from "../lib/AppStateContext";

export default function Landing() {
  const t = useT();
  return (
    <Page>
      <h1 className="text-3xl font-bold mt-8">{t("appName")}</h1>
      <p className="text-lg">{t("promise")}</p>
      <Link href="/start">
        <PrimaryButton>{t("getFreeReading")}</PrimaryButton>
      </Link>
      <ul className="flex flex-col gap-2 mt-4 text-base">
        <li>• {t("pointPrivate")}</li>
        <li>• {t("pointConsistent")}</li>
        <li>• {t("pointNextStep")}</li>
      </ul>
      <p className="text-sm text-gray-500 mt-8">{t("disclaimer")}</p>
    </Page>
  );
}
