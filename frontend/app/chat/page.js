"use client";
import { useState } from "react";
import { Chip, Page, ReadingCard, TopLinks } from "../../components/ui";
import { useAppState, useT } from "../../lib/AppStateContext";
import { askQuestion } from "../../lib/api";

const SUGGESTED = [
  "areaCareer",
  "areaRelationship",
  "areaFamily",
  "areaMoney",
];

export default function ChatPage() {
  const { state, update } = useAppState();
  const t = useT();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text) {
    const questionText = (text ?? input).trim();
    if (!questionText) return;
    setInput("");
    setLoading(true);
    const reading = await askQuestion(state.birthDetails, questionText);
    const entry = {
      id: crypto.randomUUID(),
      question: questionText,
      reading,
      feedback: null,
      createdAt: new Date().toISOString(),
    };
    update((prev) => ({ chat: [...prev.chat, entry] }));
    setLoading(false);
  }

  function setFeedback(id, value) {
    update((prev) => ({
      chat: prev.chat.map((e) => (e.id === id ? { ...e, feedback: value } : e)),
    }));
  }

  function setOpenQuestion(questionText) {
    update({ openQuestion: questionText });
  }

  return (
    <>
      <TopLinks t={t} />
      <Page>
        <h1 className="text-2xl font-bold">{t("chatTitle")}</h1>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((key) => (
            <Chip key={key} onClick={() => send(t(key))}>
              {t(key)}
            </Chip>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {state.chat.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-2">
              <p className="text-base font-medium">{entry.question}</p>
              <ReadingCard t={t} reading={entry.reading} />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFeedback(entry.id, "helpful")}
                  className={`min-h-[48px] px-4 rounded-2xl border ${
                    entry.feedback === "helpful" ? "border-accent bg-bg-elevated" : "border-border"
                  }`}
                >
                  👍 {t("helpful")}
                </button>
                <button
                  type="button"
                  onClick={() => setFeedback(entry.id, "not_helpful")}
                  className={`min-h-[48px] px-4 rounded-2xl border ${
                    entry.feedback === "not_helpful" ? "border-accent bg-bg-elevated" : "border-border"
                  }`}
                >
                  👎 {t("notHelpful")}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenQuestion(entry.question)}
                  className="text-sm underline ml-auto"
                >
                  {state.openQuestion === entry.question ? "✓" : t("setAsOpenQuestion")}
                </button>
              </div>
            </div>
          ))}
          {loading && <p className="text-base text-fg-muted">{t("readingChart")}</p>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2 mt-auto sticky bottom-0 bg-bg pt-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("askAnything")}
            className="flex-1 min-h-[48px] border border-border rounded-2xl px-4 bg-bg-elevated text-fg text-base"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="min-h-[48px] px-6 rounded-2xl bg-accent text-bg font-medium disabled:bg-bg-elevated disabled:text-fg-muted"
          >
            {t("send")}
          </button>
        </form>
      </Page>
    </>
  );
}
