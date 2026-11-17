"use client";
import { Page } from "../../components/ui";
import { useT } from "../../lib/AppStateContext";

export default function PrivacyPage() {
  const t = useT();
  return (
    <Page>
      <h1 className="text-2xl font-bold">{t("privacyTitle")}</h1>

      <Section icon="🔒" title={t("privacyWhatTitle")} body={t("consentWhat")} />
      <Section icon="🔒" title={t("privacyWhyTitle")} body={t("consentWhy")} />
      <Section icon="🔒" title={t("privacyWhoSeesTitle")} body={t("privacyWhoSeesBody")} />
      <Section icon="🔒" title={t("privacyHowLongTitle")} body={t("privacyHowLongBody")} />
      <Section icon="🔒" title={t("privacyHowToDeleteTitle")} body={t("privacyHowToDeleteBody")} />
      <Section icon="🔒" title={t("privacyContactTitle")} body="support@astroguide.example" />
    </Page>
  );
}

function Section({ icon, title, body }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <p className="text-base text-fg-muted">{body}</p>
    </section>
  );
}
