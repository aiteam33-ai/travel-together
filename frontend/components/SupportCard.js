"use client";

export function SupportCard({ t }) {
  return (
    <div className="border border-accent rounded-2xl p-4 bg-bg-elevated flex flex-col gap-4">
      <p className="text-base font-medium">{t("distressTitle")}</p>
      <p className="text-base">{t("distressBody")}</p>
      <a
        href="tel:14416"
        className="w-full min-h-[48px] rounded-2xl bg-accent text-bg font-medium px-6 py-4 flex items-center justify-center"
      >
        {t("distressTalkButton")}
      </a>
      <p className="text-base text-fg-muted">{t("talkToSomeone")}</p>
    </div>
  );
}

export function OutOfScopeCard({ t }) {
  return (
    <div className="border border-border rounded-2xl p-4 bg-bg-elevated flex flex-col gap-4">
      <p className="text-base">{t("outOfScope")}</p>
      <p className="text-base text-fg-muted">{t("outOfScopeNextStep")}</p>
    </div>
  );
}
