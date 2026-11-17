"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chip, Page, PrimaryButton, SecondaryButton } from "../../components/ui";
import { useAppState, useT } from "../../lib/AppStateContext";
import { askQuestion, submitTrustResult } from "../../lib/api";

const AREAS = ["areaCareer", "areaRelationship", "areaFamily", "areaMind", "areaMoney", "areaMove"];

const EXAMPLE_CHIPS = [
  "Why did my career stall in 2023?",
  "What happened around my breakup?",
];

export default function TrustPage() {
  const { state, update } = useAppState();
  const t = useT();
  const router = useRouter();
  const [event, setEvent] = useState("");
  const [monthYear, setMonthYear] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [note, setNote] = useState("");
  const [showMeaning, setShowMeaning] = useState(false);

  const canSubmit = event.trim() && monthYear.trim() && area;

  async function handleSubmit() {
    setLoading(true);
    const result = await askQuestion(state.birthDetails, `${event} ${monthYear} ${area}`);
    setReading(result);
    setLoading(false);
    update({ freeReadingUsed: true });
  }

  function handleFeedback(choice) {
    setFeedback(choice);
    const result = { event, monthYear, area, result: reading, feedback: choice, note: "" };
    update({ trustTest: result });
    submitTrustResult(result);
  }

  function handleNoteSubmit() {
    update((prev) => ({
      trustTest: { ...prev.trustTest, note },
    }));
    submitTrustResult({ ...state.trustTest, note });
  }

  if (loading) {
    return (
      <Page>
        <p className="text-lg text-center mt-20">{t("readingChart")}</p>
      </Page>
    );
  }

  if (reading) {
    return (
      <Page>
        <h1 className="text-2xl font-bold">{t("trustTitle")}</h1>

        <div className="border border-border rounded-2xl p-4 bg-bg-elevated flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-fg-muted mb-2">{t("chartReason")}</p>
            <p className="text-base">{reading.chartReason}</p>
          </div>
          <button type="button" onClick={() => setShowMeaning((v) => !v)} className="text-base underline text-left">
            {t("whatDoesMean")}
          </button>
          {showMeaning && <p className="text-base text-fg-muted">{reading.whatItMeans}</p>}
          <div className="bg-bg rounded-2xl p-4 border border-accent">
            <p className="text-sm font-semibold text-accent mb-2">{t("nextStep")}</p>
            <p className="text-base font-medium">{reading.nextStep}</p>
          </div>
          <p className="text-base text-fg-muted">{t("disclaimer")}</p>
        </div>

        {!feedback && (
          <div className="flex gap-2">
            <Chip onClick={() => handleFeedback("matches")}>{t("matches")}</Chip>
            <Chip onClick={() => handleFeedback("partly")}>{t("partly")}</Chip>
            <Chip onClick={() => handleFeedback("no_match")}>{t("noMatch")}</Chip>
          </div>
        )}
        {feedback && feedback !== "matches" && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("whatWasDifferent")}
              className="min-h-[48px] border border-border rounded-2xl px-4 bg-bg-elevated text-fg text-base"
            />
            <SecondaryButton onClick={handleNoteSubmit}>{t("continue")}</SecondaryButton>
          </div>
        )}
        {feedback && (
          <>
            <p className="text-base">{t("thankYouHonest")}</p>
            <div className="flex flex-col gap-4 mt-2">
              <SecondaryButton
                onClick={() => {
                  setReading(null);
                  setFeedback(null);
                  setEvent("");
                  setMonthYear("");
                  setArea("");
                  setNote("");
                }}
              >
                {t("tryAnotherPast")}
              </SecondaryButton>
              <PrimaryButton onClick={() => router.push("/chat")}>{t("askAboutFuture")}</PrimaryButton>
            </div>
          </>
        )}
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold">{t("trustTitle")}</h1>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_CHIPS.map((ex) => (
          <Chip key={ex} selected={event === ex} onClick={() => setEvent(ex)}>
            {ex}
          </Chip>
        ))}
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-base font-medium">{t("trustPastEvent")}</span>
        <input
          type="text"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          className="min-h-[48px] border border-border rounded-2xl px-4 bg-bg-elevated text-fg text-lg"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-base font-medium">{t("trustMonthYear")}</span>
        <input
          type="month"
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          className="min-h-[48px] border border-border rounded-2xl px-4 bg-bg-elevated text-fg text-lg"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-base font-medium">{t("trustArea")}</span>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <Chip key={a} selected={area === a} onClick={() => setArea(a)}>
              {t(a)}
            </Chip>
          ))}
        </div>
        {area === "areaMind" && <p className="text-base text-fg-muted">{t("illnessNote")}</p>}
      </div>

      <PrimaryButton disabled={!canSubmit} onClick={handleSubmit}>
        {t("trustSubmit")}
      </PrimaryButton>
    </Page>
  );
}
