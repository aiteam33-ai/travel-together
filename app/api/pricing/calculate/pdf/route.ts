import { NextRequest, NextResponse } from "next/server";
import { calculatorRequestSchema } from "@/lib/validation/calculator";
import { buildPricingInput } from "@/lib/pricing/build-input";
import { computePricing } from "@/lib/pricing/engine";
import { generateCalculationPdf } from "@/lib/pdf/invoice";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const schema = calculatorRequestSchema.extend({ tourId: z.string() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const tour = await prisma.tour.findUnique({ where: { id: parsed.data.tourId } });
  if (!tour) return NextResponse.json({ error: "Tour not found" }, { status: 404 });

  const input = await buildPricingInput(parsed.data);
  const output = computePricing(input);
  const pdfBytes = await generateCalculationPdf({ tourTitle: tour.title, output });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="trip-cost-${tour.slug}.pdf"`,
    },
  });
}
