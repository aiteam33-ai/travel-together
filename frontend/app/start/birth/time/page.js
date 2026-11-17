"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chip, Page, PrimaryButton, SecondaryButton, ProgressBar } from "../../../../components/ui";
import { useAppState, useT } from "../../../../lib/AppStateContext";

const ROUGH_TIMES = ["morning", "afternoon", "evening", "night"];

export default function TimePage() {
  const { state, update } = useAppState();
  const t = useT();
  const router = useRouter();
  const [time, setTime] = useState(state.birthDetails?.time || "");
  const [timeUnknown, setTimeUnknown] = useState(state.birthDetails?.timeUnknown || false);
  const [roughTime, setRoughTime] = useState(state.birthDetails?.roughTime || "");

  const canNext = timeUnknown ? !!roughTime : !!time;

  function handleNext() {
    update({
      birthDetails: {
        ...state.birthDetails,
        time: timeUnknown ? "" : time,
        timeUnknown,
        roughTime: timeUnknown ? roughTime : "",
      },
    });
    router.push("/start/birth/place");
  }

  return (
    <Page>
      <ProgressBar step={3} total={4} />
      <p className="text-base text-fg-muted">{t("stepOf", { n: 3, total: 4 })}</p>
      <h1 className="text-2xl font-bold">{t("timeQuestion")}</h1>
      <p className="text-base text-fg-muted">{t("timeReason")}</p>

      {!timeUnknown && (
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="min-h-[48px] border border-border rounded-2xl px-4 bg-bg-elevated text-fg text-lg"
          autoFocus
        />
      )}

      <label className="flex items-center gap-4 min-h-[48px] text-base">
        <input
          type="checkbox"
          className="w-6 h-6 accent-[var(--color-accent)]"
          checked={timeUnknown}
          onChange={(e) => setTimeUnknown(e.target.checked)}
        />
        {t("dontKnowTime")}
      </label>

      {timeUnknown && (
        <div className="flex flex-col gap-4">
          <p className="text-base font-medium">{t("roughTimeQuestion")}</p>
          <div className="flex flex-wrap gap-2">
            {ROUGH_TIMES.map((rt) => (
              <Chip key={rt} selected={roughTime === rt} onClick={() => setRoughTime(rt)}>
                {t(rt)}
              </Chip>
            ))}
          </div>
          <p className="text-base text-fg-muted">{t("timeUnknownNote")}</p>
        </div>
      )}

      <div className="flex gap-4 mt-4">
        <SecondaryButton onClick={() => router.push("/start/birth/date")}>{t("back")}</SecondaryButton>
        <PrimaryButton disabled={!canNext} onClick={handleNext}>
          {t("next")}
        </PrimaryButton>
      </div>
    </Page>
  );
}
