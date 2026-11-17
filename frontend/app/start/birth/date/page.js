"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Page, PrimaryButton, SecondaryButton, ProgressBar } from "../../../../components/ui";
import { useAppState, useT } from "../../../../lib/AppStateContext";

export default function DatePage() {
  const { state, update } = useAppState();
  const t = useT();
  const router = useRouter();
  const [date, setDate] = useState(state.birthDetails?.date || "");

  function handleNext() {
    update({ birthDetails: { ...state.birthDetails, date } });
    router.push("/start/birth/time");
  }

  return (
    <Page>
      <ProgressBar step={2} total={4} />
      <p className="text-base text-fg-muted">{t("stepOf", { n: 2, total: 4 })}</p>
      <h1 className="text-2xl font-bold">{t("dateQuestion")}</h1>
      <p className="text-base text-fg-muted">{t("dateReason")}</p>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="min-h-[48px] border border-border rounded-2xl px-4 bg-bg-elevated text-fg text-lg"
        autoFocus
      />
      <div className="flex gap-4 mt-4">
        <SecondaryButton onClick={() => router.push("/start/birth/name")}>{t("back")}</SecondaryButton>
        <PrimaryButton disabled={!date} onClick={handleNext}>
          {t("next")}
        </PrimaryButton>
      </div>
    </Page>
  );
}
