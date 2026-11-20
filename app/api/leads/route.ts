import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { sendMessage } from "@/lib/mocks/outbox";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  source: z.enum(["WHATSAPP_BUTTON", "CALLBACK_REQUEST", "ENQUIRY_FORM"]),
  tourId: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid lead." }, { status: 400 });
  const user = await getCurrentUser();
  const lead = await prisma.lead.create({
    data: { ...parsed.data, userId: user?.id },
  });
  await sendMessage("WHATSAPP", "branch-team", `New lead from ${parsed.data.name} (${parsed.data.phone}) via ${parsed.data.source}.`);
  return NextResponse.json({ ok: true, leadId: lead.id });
}
