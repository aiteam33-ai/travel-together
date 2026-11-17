"use client";
import { useRouter } from "next/navigation";
import { Page, PrimaryButton } from "../../components/ui";
import { useAppState, useT } from "../../lib/AppStateContext";
import { LANGS } from "../../lib/mock/translations";

export default function LanguagePage() {
  const { state, update } = useAppState();
  const t = useT();
  const router = useRouter();
  const selected = state.language;

  function choose(lang) {
    update({ language: lang });
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold mt-4">{t("chooseLanguage")}</h1>
      <div className="flex flex-col gap-3">
        {LANGS.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => choose(lang)}
            className={`min-h-[48px] rounded-md border px-4 text-left text-lg ${
              selected === lang ? "border-black bg-gray-100" : "border-gray-300"
            }`}
          >
            {t(lang)}
          </button>
        ))}
      </div>
      <PrimaryButton disabled={!selected} onClick={() => router.push("/start/consent")}>
        {t("continue")}
      </PrimaryButton>
    </Page>
  );
}
