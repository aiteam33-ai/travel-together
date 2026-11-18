"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChartWheel } from "../../../../components/ChartWheel";
import { Page, PrimaryButton, SecondaryButton } from "../../../../components/ui";
import { useAppState, useT } from "../../../../lib/AppStateContext";
import { getChart } from "../../../../lib/api";

export default function SummaryPage() {
  const { state } = useAppState();
  const t = useT();
  const router = useRouter();
  const [drawing, setDrawing] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const bd = state.birthDetails || {};

  useEffect(() => {
    if (!drawing) return;
    let active = true;
    getChart(bd).then(() => {
      if (active) setChartReady(true);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing]);

  if (drawing) {
    return (
      <Page>
        <p className="text-lg text-center mt-10">{t("drawingChart")}</p>
        <ChartWheel
          birthDetails={bd}
          chartReady={chartReady}
          onDone={() => router.push("/trust")}
          onSkip={() => router.push("/trust")}
          t={t}
        />
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold">{t("summaryTitle")}</h1>
      <div className="border border-border rounded-2xl divide-y divide-border bg-bg-elevated">
        <SummaryRow label={t("nameQuestion")} value={bd.name} editHref="/start/birth/name" editLabel={t("edit")} />
        <SummaryRow label={t("dateQuestion")} value={bd.date} editHref="/start/birth/date" editLabel={t("edit")} />
        <SummaryRow
          label={t("timeQuestion")}
          value={bd.timeUnknown ? bd.roughTime : bd.time}
          editHref="/start/birth/time"
          editLabel={t("edit")}
        />
        <SummaryRow
          label={t("placeQuestion")}
          value={bd.place ? `${bd.place.name}, ${bd.place.state}` : ""}
          editHref="/start/birth/place"
          editLabel={t("edit")}
        />
      </div>
      <div className="flex gap-4 mt-4">
        <SecondaryButton onClick={() => router.push("/start/birth/place")}>{t("back")}</SecondaryButton>
        <PrimaryButton onClick={() => setDrawing(true)}>{t("drawChart")}</PrimaryButton>
      </div>
    </Page>
  );
}

function SummaryRow({ label, value, editHref, editLabel }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-4 py-4 min-h-[48px]">
      <div>
        <p className="text-sm text-fg-muted">{label}</p>
        <p className="text-base">{value || "—"}</p>
      </div>
      <button type="button" onClick={() => router.push(editHref)} className="text-base underline min-h-[48px]">
        {editLabel}
      </button>
    </div>
  );
}
