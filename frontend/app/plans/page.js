"use client";
import { useState } from "react";
import { AppShell } from "../../components/AppShell";
import { Page, PrimaryButton } from "../../components/ui";
import { useAppState, useT } from "../../lib/AppStateContext";
import { startSubscription } from "../../lib/api";

export default function PlansPage() {
  const { state, update } = useAppState();
  const t = useT();
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    setPaying(true);
    await startSubscription();
    update({ subscribed: true });
    setPaying(false);
  }

  return (
    <AppShell>
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

        {state.subscribed ? (
          <p className="text-base font-medium text-accent">{t("thankYouSubscribed")}</p>
        ) : paying ? (
          <p className="text-base text-fg-muted">{t("processingPayment")}</p>
        ) : (
          <PrimaryButton onClick={handlePay}>{t("payWithUpi")}</PrimaryButton>
        )}
      </Page>
    </AppShell>
  );
}
