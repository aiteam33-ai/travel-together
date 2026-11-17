"use client";
import { useState } from "react";
import { Page, PrimaryButton, TopLinks } from "../../components/ui";
import { useT } from "../../lib/AppStateContext";

export default function PlansPage() {
  const t = useT();
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <TopLinks t={t} />
      <Page>
        <h1 className="text-2xl font-bold">{t("plansTitle")}</h1>
        <p className="text-base">{t("firstFreeNote")}</p>
        <p className="text-xl font-bold">{t("priceLine")}</p>
        <ul className="flex flex-col gap-2 text-base">
          <li>• {t("benefitUnlimited")}</li>
          <li>• {t("benefitDaily")}</li>
          <li>• {t("benefitConsistent")}</li>
          <li>• {t("benefitPrivate")}</li>
          <li>• {t("benefitNoUpsell")}</li>
          <li>• {t("benefitCancel")}</li>
        </ul>

        {clicked ? (
          <p className="text-base text-fg-muted">{t("paymentsComingSoon")}</p>
        ) : (
          <PrimaryButton onClick={() => setClicked(true)}>{t("payWithUpi")}</PrimaryButton>
        )}
      </Page>
    </>
  );
}
