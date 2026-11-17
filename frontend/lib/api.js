// Every page talks to the product through these functions only.
// All of them are fake for now (lib/mock); a real backend can replace the
// bodies here later without any page needing to change.
import { fakeChartFor, fakeDailyUpdate, pickReading } from "./mock/chart";

const FAKE_DELAY_MS = 1200;

function delay(ms = FAKE_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getChart(birthDetails) {
  await delay();
  return fakeChartFor(birthDetails);
}

export async function askQuestion(birthDetails, questionText) {
  await delay();
  return pickReading(birthDetails, questionText);
}

export async function getDailyUpdate(birthDetails, openQuestion) {
  await delay(600);
  return fakeDailyUpdate(birthDetails, openQuestion);
}

export async function startSubscription() {
  await delay(1500);
  return { success: true };
}

export async function submitWaitlist(entry) {
  await delay(400);
  console.log("waitlist submission (fake, not sent anywhere yet):", entry);
  return { success: true };
}

export async function readPalm() {
  await delay(1500);
  return {
    summary: "Your lines suggest a steady, practical streak with one strong creative line.",
  };
}
