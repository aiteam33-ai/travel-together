"use client";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "./ui";
import { startSubscription } from "../lib/api";

export function PaywallSheet({ t, onClose, onSubscribed }) {
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    setPaying(true);
    await startSubscription();
    onSubscribed();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label={t("maybeLater")}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative w-full max-w-md bg-bg-elevated border-t border-border rounded-t-2xl p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold">{t("keepGoingFor", { price: "₹199" })}</h2>
        <ul className="flex flex-col gap-2 text-base">
          <li>• {t("benefitUnlimited")}</li>
          <li>• {t("benefitDaily")}</li>
          <li>• {t("benefitConsistent")}</li>
          <li>• {t("benefitPrivate")}</li>
          <li>• {t("benefitNoUpsell")}</li>
          <li>• {t("benefitCancel")}</li>
        </ul>
        {paying ? (
          <p className="text-base text-fg-muted">{t("processingPayment")}</p>
        ) : (
          <>
            <PrimaryButton onClick={handlePay}>{t("payWithUpi")}</PrimaryButton>
            <SecondaryButton onClick={onClose}>{t("maybeLater")}</SecondaryButton>
          </>
        )}
      </div>
    </div>
  );
}
