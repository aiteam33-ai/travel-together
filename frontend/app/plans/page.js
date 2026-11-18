"use client";
import { useState } from "react";
import { AppShell } from "../../components/AppShell";
import { TrustProofBlock } from "../../components/TrustProofBlock";
import { Page, PrimaryButton } from "../../components/ui";
import { useAppState, useT } from "../../lib/AppStateContext";
import { track } from "../../lib/analytics";
import { startSubscription } from "../../lib/api";
import { DAILY_PRICE_INR, PRICE_INR } from "../../lib/config";

export default function PlansPage() {
  const { state, update } = useAppState();
  const t = useT();
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    track("upi_clicked");
    setPaying(true);
    await startSubscription();
    update({ subscribed: true });
    track("subscribed");
    setPaying(false);
  }

  return (
    <AppShell>
      <Page>
        <h1 className="text-2xl font-bold">{t("plansTitle")}</h1>
        <p className="text-base">{t("firstFreeNote")}</p>

        <TrustProofBlock t={t} trustTestResults={state.trustTest ? [state.trustTest] : []} />

        <p className="text-base text-fg-muted">{t("astrologerComparison")}</p>

        <div>
          <p className="text-xl font-bold">{t("priceLine", { price: PRICE_INR })}</p>
          <p className="text-base text-fg-muted">{t("dailyPriceLine", { daily: DAILY_PRICE_INR })}</p>
        </div>

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
