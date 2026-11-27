import { NextRequest, NextResponse } from "next/server";
import { calculatorRequestSchema } from "@/lib/validation/calculator";
import { buildPricingInput } from "@/lib/pricing/build-input";
import { computePricing } from "@/lib/pricing/engine";
import { getCurrentUser } from "@/lib/auth/session";
import { logEvent } from "@/lib/groups/access";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = calculatorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const input = await buildPricingInput(parsed.data);
    const output = computePricing(input);
    // Fire-and-forget: the client already debounces calls to this route, so this
    // no longer runs per keystroke, but the analytics write still shouldn't make
    // the user wait on their price update.
    getCurrentUser()
      .then((user) => logEvent("CALCULATOR_USED", user?.id, { tourId: input.tourId }))
      .catch(() => {});
    return NextResponse.json({ input, output });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not compute pricing for this departure." }, { status: 400 });
  }
}
