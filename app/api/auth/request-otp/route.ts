import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestOtp } from "@/lib/auth/otp";

const schema = z.object({
  identifier: z.string().min(5),
  channel: z.enum(["SMS", "EMAIL"]).default("SMS"),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid phone or email." }, { status: 400 });
  await requestOtp(parsed.data.identifier, parsed.data.channel);
  return NextResponse.json({ sent: true });
}
