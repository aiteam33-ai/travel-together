"use client";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "./ui";
import { track } from "../lib/analytics";
import { startSubscription } from "../lib/api";
import { DAILY_PRICE_INR, PRICE_INR } from "../lib/config";

const TOP_BENEFITS = ["benefitUnlimited", "benefitDaily", "benefitConsistent"];
const REST_BENEFITS = ["benefitPrivate", "benefitNoUpsell", "benefitCancel"];

export function PaywallSheet({ t, onClose, onSubscribed }) {
  const [paying, setPaying] = useState(false);
  const [showAll, setShowAll] = useState(false);

  async function handlePay() {
    track("upi_clicked");
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
      <div className="relative w-full max-w-md max-h-[85vh] bg-bg-elevated border-t border-border rounded-t-2xl flex flex-col">
        <div className="p-6 pb-2 flex-shrink-0">
          <h2 className="text-xl font-bold">{t("keepGoingFor", { price: `₹${PRICE_INR}` })}</h2>
          <p className="text-base text-fg-muted">{t("dailyPriceLine", { daily: DAILY_PRICE_INR })}</p>
        </div>

        <div className="px-6 flex-1 overflow-y-auto flex flex-col gap-3">
          <ul className="flex flex-col gap-2 text-base">
            {TOP_BENEFITS.map((key) => (
              <li key={key}>• {t(key)}</li>
            ))}
            {showAll && REST_BENEFITS.map((key) => <li key={key}>• {t(key)}</li>)}
          </ul>
          {!showAll && (
            <button type="button" onClick={() => setShowAll(true)} className="text-base underline self-start">
              {t("seeEverythingIncluded")}
            </button>
          )}
        </div>

        <div className="p-6 pt-2 flex-shrink-0 flex flex-col gap-4">
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
    </div>
  );
}
