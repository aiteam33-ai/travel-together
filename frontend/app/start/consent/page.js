"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Page, PrimaryButton } from "../../../components/ui";
import { useAppState, useT } from "../../../lib/AppStateContext";

export default function ConsentPage() {
  const { state, update } = useAppState();
  const t = useT();
  const router = useRouter();
  const [age18, setAge18] = useState(state.ageConfirmed);
  const [agree, setAgree] = useState(state.consentGiven);
  const [showUnder18, setShowUnder18] = useState(false);

  function handleAge18(checked) {
    setAge18(checked);
    if (!checked) {
      setShowUnder18(true);
    } else {
      setShowUnder18(false);
    }
  }

  function handleContinue() {
    update({ consentGiven: true, ageConfirmed: true });
    router.push("/start/birth/name");
  }

  if (showUnder18) {
    return (
      <Page>
        <h1 className="text-2xl font-bold mt-4">{t("consentTitle")}</h1>
        <p className="text-base">{t("under18")}</p>
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold mt-4">{t("consentTitle")}</h1>
      <ul className="flex flex-col gap-4 text-base">
        <li>{t("consentWhat")}</li>
        <li>{t("consentWhy")}</li>
        <li>{t("consentShare")}</li>
        <li>{t("consentDelete")}</li>
      </ul>
      <Link href="/privacy" className="text-base underline">{t("privacyLink")}</Link>

      <label className="flex items-center gap-4 min-h-[48px] text-base">
        <input
          type="checkbox"
          className="w-6 h-6 accent-[var(--color-accent)]"
          checked={age18}
          onChange={(e) => handleAge18(e.target.checked)}
        />
        {t("consentAgree18")}
      </label>

      <label className="flex items-center gap-4 min-h-[48px] text-base">
        <input
          type="checkbox"
          className="w-6 h-6 accent-[var(--color-accent)]"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        {t("consentAgree")}
      </label>

      <PrimaryButton disabled={!age18 || !agree} onClick={handleContinue}>
        {t("continue")}
      </PrimaryButton>
    </Page>
  );
}
