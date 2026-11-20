import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { simulatePayment } from "@/lib/mocks/payment-gateway";
import { sendMessage } from "@/lib/mocks/outbox";

const schema = z.object({
  method: z.enum(["UPI", "CARD", "NETBANKING", "EMI"]),
  amount: z.number().int().positive(),
  simulate: z.enum(["SUCCESS", "FAILED", "PENDING", "RANDOM"]).default("RANDOM"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const booking = await prisma.booking.findFirst({ where: { id, userId: user.id } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date() && booking.status === "HELD") {
    return NextResponse.json({ error: "Your seat hold has expired. Please start the booking again." }, { status: 410 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment request." }, { status: 400 });

  const result = simulatePayment(parsed.data.method, parsed.data.simulate);

  await prisma.payment.create({
    data: { bookingId: booking.id, amount: parsed.data.amount, method: parsed.data.method, status: result },
  });

  if (result === "SUCCESS") {
    const newAmountPaid = booking.amountPaid + parsed.data.amount;
    const fullyPaid = newAmountPaid >= booking.amountDue;
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        amountPaid: newAmountPaid,
        status: fullyPaid ? "CONFIRMED" : "PARTIALLY_PAID",
        holdExpiresAt: null,
      },
    });
    const contact = user.email ?? user.phone ?? "unknown";
    await sendMessage("EMAIL", contact, `Your booking ${booking.bookingRef} is confirmed. Amount paid: ₹${(parsed.data.amount / 100).toLocaleString("en-IN")}.`, "Booking confirmed — Parikrama Holidays");
    if (user.phone) {
      await sendMessage("WHATSAPP", user.phone, `Your booking ${booking.bookingRef} is confirmed!`);
    }
  }

  return NextResponse.json({ ok: true, result });
}
