"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { ShareDayCard } from "../../components/ShareDayCard";
import { Page, PrimaryButton, SecondaryButton } from "../../components/ui";
import { ReadingCard } from "../../components/ReadingCard";
import { useAppState, useT } from "../../lib/AppStateContext";
import { track } from "../../lib/analytics";
import { getDailyUpdate } from "../../lib/api";

export default function TodayPage() {
  const { state, update } = useAppState();
  const t = useT();
  const router = useRouter();
  const [update_, setUpdateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    track("today_viewed");
    getDailyUpdate(state.birthDetails, state.openQuestion).then((data) => {
      if (active) {
        setUpdateData(data);
        setLoading(false);
        update({ todaySeenDate: data.date });
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function requestWhatsapp() {
    update({ whatsappDailyRequested: true });
    track("whatsapp_daily_requested");
  }

  return (
    <AppShell>
      <Page>
        {loading || !update_ ? (
          <p className="text-base text-fg-muted">{t("readingChart")}</p>
        ) : (
          <>
            <p className="text-sm text-fg-muted">{update_.date}</p>
            <h1 className="text-2xl font-bold">{update_.oneLineSummary}</h1>

            {state.openQuestion ? (
              <div className="flex flex-col gap-2">
                <p className="text-base font-medium">{t("aboutYourQuestion", { q: state.openQuestion })}</p>
                <ReadingCard t={t} reading={update_.reading} />
              </div>
            ) : (
              <div className="border border-border rounded-2xl p-4 flex flex-col gap-4 bg-bg-elevated">
                <p className="text-base">{t("noOpenQuestion")}</p>
                <SecondaryButton onClick={() => router.push("/chat")}>{t("chooseQuestion")}</SecondaryButton>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 mt-2">
              <Tile label={t("goodTimeFor")} value={update_.goodTimeFor} />
              <Tile label={t("beCarefulWith")} value={update_.carefulWith} />
              <Tile label={t("luckyColour")} value={update_.luckyColour} />
            </div>

            {state.whatsappDailyRequested ? (
              <p className="text-base text-fg-muted mt-2">{t("comingSoon")}</p>
            ) : (
              <PrimaryButton onClick={requestWhatsapp}>{t("whatsappDaily")}</PrimaryButton>
            )}

            <ShareDayCard t={t} date={update_.date} luckyColour={update_.luckyColour} />
          </>
        )}
      </Page>
    </AppShell>
  );
}

function Tile({ label, value }) {
  return (
    <div className="border border-border rounded-2xl p-4 bg-bg-elevated">
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  );
}
