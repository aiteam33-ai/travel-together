// Exports the /overview page to docs/product-overview.pdf using Puppeteer
// (a headless Chrome instance). This is the simplest reliable way to turn a
// styled HTML page — with the site's own fonts, colours and print
// stylesheet — into an exact, two-page PDF: Chrome itself renders the page
// and prints it, so the PDF matches what you see in a browser print preview.
//
// Requires the dev server to already be running (npm run dev) at
// http://localhost:3000, since this script just drives a browser against it.

import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const URL = process.env.OVERVIEW_URL ?? "http://localhost:3000/overview";
const OUT_DIR = path.resolve("docs");
const OUT_FILE = path.join(OUT_DIR, "product-overview.pdf");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    await page.pdf({
      path: OUT_FILE,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    console.log(`Saved ${OUT_FILE}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
