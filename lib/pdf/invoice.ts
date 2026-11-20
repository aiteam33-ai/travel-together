import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatRupeesAscii, formatDateIST } from "../pricing/format";
import { BRAND } from "../brand";
import type { PricingEngineOutput } from "../pricing/types";

export async function generateInvoicePdf(opts: {
  bookingRef: string;
  tourTitle: string;
  departureDate: Date;
  travellerNames: string[];
  output: PricingEngineOutput;
  amountPaid: number;
  amountDue: number;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;
  const lineHeight = 18;

  function text(str: string, opts2: { size?: number; font?: typeof font; color?: ReturnType<typeof rgb> } = {}) {
    page.drawText(str, { x: left, y, size: opts2.size ?? 11, font: opts2.font ?? font, color: opts2.color ?? rgb(0.15, 0.1, 0.05) });
    y -= lineHeight;
  }

  function row(label: string, value: string) {
    page.drawText(label, { x: left, y, size: 11, font });
    page.drawText(value, { x: 380, y, size: 11, font });
    y -= lineHeight;
  }

  text(BRAND.name, { size: 18, font: bold, color: rgb(0.76, 0.27, 0.05) });
  text(`GSTIN: ${BRAND.gstin}`, { size: 10 });
  y -= 6;
  text("TAX INVOICE", { size: 14, font: bold });
  y -= 6;

  row("Booking reference:", opts.bookingRef);
  row("Tour:", opts.tourTitle);
  row("Departure date:", formatDateIST(opts.departureDate));
  row("Invoice date:", formatDateIST(new Date()));
  y -= 6;

  text("Travellers:", { font: bold });
  for (const name of opts.travellerNames) text(`  - ${name}`, { size: 10 });
  y -= 6;

  text("Paid to us", { font: bold });
  for (const l of opts.output.paidToUs) row(`  ${l.label}${l.isEstimate ? " (estimate)" : ""}`, formatRupeesAscii(l.amount));
  row("  Subtotal", formatRupeesAscii(opts.output.paidToUsSubtotal));
  y -= 4;

  text("Taxes", { font: bold });
  for (const l of opts.output.taxes) row(`  ${l.label}`, formatRupeesAscii(l.amount));
  row("  Taxes subtotal", formatRupeesAscii(opts.output.taxesSubtotal));
  y -= 4;

  text("Grand total", { font: bold, size: 13 });
  row("  Grand total (paid to us + taxes)", formatRupeesAscii(opts.output.grandTotal));
  y -= 6;

  row("Amount paid:", formatRupeesAscii(opts.amountPaid));
  row("Amount due:", formatRupeesAscii(Math.max(0, opts.amountDue - opts.amountPaid)));
  y -= 10;

  page.drawText("This is a system-generated invoice and does not require a signature.", { x: left, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) });

  return doc.save();
}

export async function generateCalculationPdf(opts: { tourTitle: string; output: PricingEngineOutput }): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;
  const lineHeight = 18;

  function text(str: string, opts2: { size?: number; font?: typeof font; color?: ReturnType<typeof rgb> } = {}) {
    page.drawText(str, { x: left, y, size: opts2.size ?? 11, font: opts2.font ?? font, color: opts2.color ?? rgb(0.15, 0.1, 0.05) });
    y -= lineHeight;
  }
  function row(label: string, value: string) {
    page.drawText(label, { x: left, y, size: 11, font });
    page.drawText(value, { x: 380, y, size: 11, font });
    y -= lineHeight;
  }

  text(BRAND.name, { size: 18, font: bold, color: rgb(0.76, 0.27, 0.05) });
  text("Trip Expense Calculation", { size: 14, font: bold });
  y -= 4;
  row("Tour:", opts.tourTitle);
  row("Generated:", formatDateIST(new Date()));
  y -= 6;

  text("Paid to us", { font: bold });
  for (const l of opts.output.paidToUs) row(`  ${l.label}${l.isEstimate ? " (estimate)" : ""}`, formatRupeesAscii(l.amount));
  row("  Subtotal", formatRupeesAscii(opts.output.paidToUsSubtotal));
  y -= 4;

  text("Taxes", { font: bold });
  for (const l of opts.output.taxes) row(`  ${l.label}`, formatRupeesAscii(l.amount));
  row("  Taxes subtotal", formatRupeesAscii(opts.output.taxesSubtotal));
  y -= 4;

  text("Your own spending (estimate, not charged by us)", { font: bold });
  for (const l of opts.output.ownSpending) row(`  ${l.label}`, formatRupeesAscii(l.amount));
  y -= 4;

  text("Grand total", { font: bold, size: 13 });
  row("  Grand total (paid to us + taxes)", formatRupeesAscii(opts.output.grandTotal));
  row("  Cost per person", formatRupeesAscii(opts.output.costPerPerson));

  return doc.save();
}
