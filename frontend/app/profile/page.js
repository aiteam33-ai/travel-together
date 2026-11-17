"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Page, PrimaryButton, SecondaryButton, TopLinks } from "../../components/ui";
import { useAppState, useT } from "../../lib/AppStateContext";
import { LANGS } from "../../lib/mock/translations";

export default function ProfilePage() {
  const { state, update, resetAll } = useAppState();
  const t = useT();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const bd = state.birthDetails || {};

  function handleDelete() {
    if (confirmText !== "DELETE") return;
    resetAll();
    setDeleted(true);
    setTimeout(() => router.push("/"), 1200);
  }

  function handleDownload() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "astroguide-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (deleted) {
    return (
      <Page>
        <p className="text-lg text-center mt-20">{t("dataDeleted")}</p>
      </Page>
    );
  }

  return (
    <>
      <TopLinks t={t} />
      <Page>
        <h1 className="text-2xl font-bold">{t("profileTitle")}</h1>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t("birthDetails")}</h2>
          <p className="text-base">{bd.name}</p>
          <p className="text-base">{bd.date}</p>
          <p className="text-base">{bd.timeUnknown ? bd.roughTime : bd.time}</p>
          <p className="text-base">{bd.place ? `${bd.place.name}, ${bd.place.state}` : ""}</p>
          <p className="text-base text-fg-muted">{t("editWarning")}</p>
          <SecondaryButton onClick={() => router.push("/start/birth/name")}>{t("edit")}</SecondaryButton>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t("chooseLanguage")}</h2>
          <div className="flex gap-2">
            {LANGS.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => update({ language: lang })}
                className={`min-h-[48px] px-4 rounded-2xl border ${
                  state.language === lang ? "border-accent bg-bg-elevated" : "border-border"
                }`}
              >
                {t(lang)}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t("myData")}</h2>
          <SecondaryButton onClick={handleDownload}>{t("downloadData")}</SecondaryButton>
          {!showConfirm ? (
            <SecondaryButton onClick={() => setShowConfirm(true)}>{t("deleteAllData")}</SecondaryButton>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t("typeDeleteToConfirm")}
                className="min-h-[48px] border border-border rounded-2xl px-4 bg-bg-elevated text-fg text-base"
              />
              <PrimaryButton disabled={confirmText !== "DELETE"} onClick={handleDelete}>
                {t("deleteAllData")}
              </PrimaryButton>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t("subscriptionStatus")}</h2>
          <p className="text-base">{state.subscribed ? t("thankYouSubscribed") : t("firstFreeNote")}</p>
        </section>

        <a href="tel:14416" className="text-base underline">
          {t("needHelp")}
        </a>
      </Page>
    </>
  );
}
