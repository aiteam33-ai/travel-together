"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Page, PrimaryButton, ProgressBar } from "../../../../components/ui";
import { useAppState, useT } from "../../../../lib/AppStateContext";

export default function NamePage() {
  const { state, update } = useAppState();
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState(state.birthDetails?.name || "");

  function handleNext() {
    update({ birthDetails: { ...state.birthDetails, name: name.trim() } });
    router.push("/start/birth/date");
  }

  return (
    <Page>
      <ProgressBar step={1} total={4} />
      <p className="text-base text-fg-muted">{t("stepOf", { n: 1, total: 4 })}</p>
      <h1 className="text-2xl font-bold">{t("nameQuestion")}</h1>
      <p className="text-base text-fg-muted">{t("nameReason")}</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-h-[48px] border border-border rounded-2xl px-4 bg-bg-elevated text-fg text-lg"
        autoFocus
      />
      <div className="flex gap-4 mt-4">
        <PrimaryButton disabled={!name.trim()} onClick={handleNext}>
          {t("next")}
        </PrimaryButton>
      </div>
    </Page>
  );
}
