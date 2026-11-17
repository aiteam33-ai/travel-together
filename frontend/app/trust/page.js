"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chip, Page, PrimaryButton, ReadingCard, SecondaryButton } from "../../components/ui";
import { useAppState, useT } from "../../lib/AppStateContext";
import { askQuestion } from "../../lib/api";

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

  const canSubmit = event.trim() && monthYear.trim() && area;

  async function handleSubmit() {
    setLoading(true);
    const result = await askQuestion(state.birthDetails, `${event} ${monthYear} ${area}`);
    setReading(result);
    setLoading(false);
  }

  function handleFeedback(choice) {
    setFeedback(choice);
    update({
      trustTest: { event, monthYear, area, result: reading, feedback: choice, note: "" },
    });
  }

  function handleNoteSubmit() {
    update((prev) => ({
      trustTest: { ...prev.trustTest, note },
    }));
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
        <ReadingCard t={t} reading={reading} />
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
              className="min-h-[48px] border border-gray-300 rounded-md px-4 text-base"
            />
            <SecondaryButton onClick={handleNoteSubmit}>{t("continue")}</SecondaryButton>
          </div>
        )}
        {feedback && (
          <>
            <p className="text-base">{t("thankYouHonest")}</p>
            <div className="flex flex-col gap-3 mt-2">
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
          className="min-h-[48px] border border-gray-300 rounded-md px-4 text-lg"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-base font-medium">{t("trustMonthYear")}</span>
        <input
          type="month"
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          className="min-h-[48px] border border-gray-300 rounded-md px-4 text-lg"
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
        {area === "areaMind" && <p className="text-sm text-gray-500">{t("illnessNote")}</p>}
      </div>

      <PrimaryButton disabled={!canSubmit} onClick={handleSubmit}>
        {t("trustSubmit")}
      </PrimaryButton>
    </Page>
  );
}
