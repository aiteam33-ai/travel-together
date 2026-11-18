"use client";
import { useState } from "react";
import { SecondaryButton } from "./ui";
import { track } from "../lib/analytics";
import { hashString } from "../lib/mock/chart";

const VIBES = [
  "A good day to start, not finish.",
  "A good day to listen more than you speak.",
  "A good day for small, steady steps.",
  "A good day to say the quiet thing out loud.",
  "A good day to rest without guilt.",
];

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
const SHARE_URL = "https://astroguide.example/?utm_source=share";

function drawCard({ date, luckyColour, appName }) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  gradient.addColorStop(0, "#11122b");
  gradient.addColorStop(1, "#1b1c3e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = "#e8b84b";
  ctx.font = "bold 64px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(appName, CARD_WIDTH / 2, 300);

  ctx.fillStyle = "#f3f1ea";
  ctx.font = "40px Arial, sans-serif";
  ctx.fillText(date, CARD_WIDTH / 2, 420);

  const vibe = VIBES[hashString(date) % VIBES.length];
  ctx.font = "48px Arial, sans-serif";
  wrapText(ctx, vibe, CARD_WIDTH / 2, 900, 880, 60);

  ctx.font = "36px Arial, sans-serif";
  ctx.fillStyle = "#b7b6cf";
  ctx.fillText("Lucky colour", CARD_WIDTH / 2, 1200);
  ctx.fillStyle = "#f3f1ea";
  ctx.font = "bold 48px Arial, sans-serif";
  ctx.fillText(luckyColour, CARD_WIDTH / 2, 1260);

  ctx.font = "32px Arial, sans-serif";
  ctx.fillStyle = "#e8b84b";
  ctx.fillText("Get your free reading at astroguide.example", CARD_WIDTH / 2, CARD_HEIGHT - 120);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, cursorY);
}

export function ShareDayCard({ t, date, luckyColour }) {
  const [busy, setBusy] = useState(false);

  async function getBlob() {
    const canvas = drawCard({ date, luckyColour, appName: t("appName") });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  async function handleDownload() {
    setBusy(true);
    const blob = await getBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astroguide-${date}.png`;
    a.click();
    URL.revokeObjectURL(url);
    setBusy(false);
  }

  async function handleShare() {
    track("share_my_day_clicked");
    setBusy(true);
    const blob = await getBlob();
    const file = new File([blob], `astroguide-${date}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: t("shareVibeGetReading"), url: SHARE_URL });
      } catch {
        // user cancelled share sheet; nothing to do
      }
    } else {
      await handleDownload();
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      <SecondaryButton disabled={busy} onClick={handleShare}>
        {t("shareMyDay")}
      </SecondaryButton>
      <div className="flex gap-2">
        <SecondaryButton disabled={busy} onClick={handleDownload}>
          {t("downloadImage")}
        </SecondaryButton>
      </div>
    </div>
  );
}
