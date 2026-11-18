"use client";
import { TESTER_QUOTES, TESTER_RESULTS_MIN_SAMPLE, TRUST_PROOF } from "../lib/config";

export function TrustProofBlock({ t, trustTestResults }) {
  const permittedQuotes = TESTER_QUOTES.filter((q) => q.permission).slice(0, 3);
  const matchRate =
    trustTestResults && trustTestResults.length >= TESTER_RESULTS_MIN_SAMPLE
      ? Math.floor((trustTestResults.filter((r) => r.feedback === "matches").length / trustTestResults.length) * 100)
      : null;

  const showFounder = TRUST_PROOF.showFounder;
  const showResearch = TRUST_PROOF.showResearch;
  const showTesterResults = TRUST_PROOF.showTesterResults && matchRate !== null;
  const showQuotes = TRUST_PROOF.showQuotes && permittedQuotes.length > 0;

  if (!showFounder && !showResearch && !showTesterResults && !showQuotes) return null;

  return (
    <div className="flex flex-col gap-3 border border-border rounded-2xl p-4 bg-bg-elevated">
      <h2 className="text-lg font-semibold">{t("whyTrustUs")}</h2>

      {showFounder && (
        <div className="flex flex-col gap-1">
          <p className="text-base">{t("founderProofLine")}</p>
          <a href="/about" className="text-sm underline text-accent self-start">
            {t("meetFounder")}
          </a>
        </div>
      )}

      {showResearch && <p className="text-base">{t("researchProofLine")}</p>}

      {showTesterResults && <p className="text-base">{t("testerResultLine", { percent: matchRate })}</p>}

      {showQuotes && (
        <div className="flex flex-col gap-2">
          {permittedQuotes.map((q, i) => (
            <div key={i} className="border-l-2 border-accent pl-3">
              <p className="text-base italic">&ldquo;{q.text}&rdquo;</p>
              <p className="text-sm text-fg-muted">
                {q.name}, {q.age}, {q.city}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
