"use client";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { PaywallSheet } from "../../components/PaywallSheet";
import { OutOfScopeCard, SupportCard } from "../../components/SupportCard";
import { Chip, Page, ReadingCard } from "../../components/ui";
import { useAppState, useT } from "../../lib/AppStateContext";
import { askQuestion } from "../../lib/api";
import { PAYWALL_ENABLED } from "../../lib/config";
import { containsDistressSignal, matchedBlockedTopic } from "../../lib/mock/safety";

const EMPTY_CHIPS = ["areaCareer", "areaRelationship", "areaMarriage", "areaSelfDoubt", "areaFamily", "areaMoney"];
const TOPIC_FOLLOWUPS = {
  areaCareer: ["areaMoney", "areaSelfDoubt"],
  areaRelationship: ["areaMarriage", "areaFamily"],
  areaMarriage: ["areaFamily", "areaRelationship"],
  areaSelfDoubt: ["areaCareer", "areaRelationship"],
  areaFamily: ["areaRelationship", "areaMoney"],
  areaMoney: ["areaCareer", "areaFamily"],
};

const TYPING_MESSAGES = ["readingChart", "checkingDasha"];

export default function ChatPage() {
  const { state, update } = useAppState();
  const t = useT();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingIdx, setTypingIdx] = useState(0);
  const [lastTopic, setLastTopic] = useState(null);
  const [showBadgeInfo, setShowBadgeInfo] = useState(null);
  const [showJump, setShowJump] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const listRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setTypingIdx((i) => (i + 1) % TYPING_MESSAGES.length), 1500);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.chat.length]);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJump(distanceFromBottom > 200);
  }

  async function send(text, topicKey) {
    const questionText = (text ?? input).trim();
    if (!questionText) return;
    setInput("");
    if (topicKey) setLastTopic(topicKey);

    if (containsDistressSignal(questionText)) {
      const entry = { id: crypto.randomUUID(), question: questionText, kind: "safety", createdAt: new Date().toISOString() };
      update((prev) => ({ chat: [...prev.chat, entry] }));
      return;
    }

    const blockedTopic = matchedBlockedTopic(questionText);
    if (blockedTopic) {
      const entry = { id: crypto.randomUUID(), question: questionText, kind: "blocked", createdAt: new Date().toISOString() };
      update((prev) => ({ chat: [...prev.chat, entry] }));
      return;
    }

    const existing = state.chat.find((e) => e.question.trim().toLowerCase() === questionText.toLowerCase());
    if (existing) {
      const entry = { ...existing, id: crypto.randomUUID(), repeatOf: existing.createdAt };
      update((prev) => ({ chat: [...prev.chat, entry] }));
      return;
    }

    const isFirstEverReading = !state.freeReadingUsed;
    if (PAYWALL_ENABLED && !state.subscribed && !isFirstEverReading) {
      setPendingQuestion(questionText);
      setPaywallOpen(true);
      return;
    }

    setLoading(true);
    const reading = await askQuestion(state.birthDetails, questionText);
    const entry = {
      id: crypto.randomUUID(),
      question: questionText,
      reading,
      feedback: null,
      createdAt: new Date().toISOString(),
    };
    update((prev) => ({ chat: [...prev.chat, entry], freeReadingUsed: true }));
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

  const suggestedKeys = lastTopic ? TOPIC_FOLLOWUPS[lastTopic] || EMPTY_CHIPS.slice(0, 2) : EMPTY_CHIPS;

  return (
    <AppShell>
      <Page>
        <h1 className="text-2xl font-bold">{t("chatTitle")}</h1>

        <div className="flex flex-wrap gap-2">
          {suggestedKeys.map((key) => (
            <Chip key={key} onClick={() => send(t(key), key)}>
              {t(key)}
            </Chip>
          ))}
        </div>

        <div ref={listRef} onScroll={handleScroll} className="flex flex-col gap-4 overflow-y-auto">
          {state.chat.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-2">
              <p className="text-base font-medium">{entry.question}</p>
              {entry.repeatOf && (
                <p className="text-sm text-fg-muted">
                  {t("askedBefore", { date: new Date(entry.repeatOf).toLocaleDateString() })}
                </p>
              )}
              {entry.kind === "safety" && <SupportCard t={t} />}
              {entry.kind === "blocked" && <OutOfScopeCard t={t} />}
              {!entry.kind && (
                <>
                  <ReadingCard t={t} reading={entry.reading} />
                  <button
                    type="button"
                    onClick={() => setShowBadgeInfo(showBadgeInfo === entry.id ? null : entry.id)}
                    className="text-sm text-accent underline self-start"
                  >
                    {t("sameChartBadge")}
                  </button>
                  {showBadgeInfo === entry.id && <p className="text-base text-fg-muted">{t("sameChartExplain")}</p>}
                  <div className="flex items-center gap-4 flex-wrap">
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
                      className="text-base underline ml-auto"
                    >
                      {state.openQuestion === entry.question ? "✓" : t("setAsOpenQuestion")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {loading && <p className="text-base text-fg-muted">{t(TYPING_MESSAGES[typingIdx])}</p>}
          <div ref={bottomRef} />
        </div>

        {showJump && (
          <button
            type="button"
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="self-center min-h-[48px] px-4 rounded-2xl border border-accent text-accent"
          >
            {t("jumpToLatest")}
          </button>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2 mt-auto sticky bottom-[64px] md:bottom-0 bg-bg pt-2"
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

        {justSubscribed && <p className="text-base text-center text-accent">{t("thankYouSubscribed")}</p>}

        {paywallOpen && (
          <PaywallSheet
            t={t}
            onClose={() => {
              setPaywallOpen(false);
              setPendingQuestion(null);
            }}
            onSubscribed={() => {
              update({ subscribed: true });
              setPaywallOpen(false);
              setJustSubscribed(true);
              setTimeout(() => setJustSubscribed(false), 3000);
              if (pendingQuestion) {
                send(pendingQuestion);
                setPendingQuestion(null);
              }
            }}
          />
        )}
      </Page>
    </AppShell>
  );
}
