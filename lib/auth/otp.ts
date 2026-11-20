import { prisma } from "../db/client";
import { sendMessage } from "../mocks/outbox";

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Mock OTP provider: logs the code to the server console and the outbox
 * instead of sending a real SMS/email. Swap sendMessage's body for a real
 * provider later without changing any call site.
 */
export async function requestOtp(identifier: string, channel: "SMS" | "EMAIL" = "SMS") {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await prisma.otpCode.create({ data: { identifier, code, expiresAt } });
  console.log(`[OTP] code for ${identifier}: ${code} (valid ${OTP_TTL_MINUTES} min)`);
  await sendMessage(channel, identifier, `Your Parikrama Holidays OTP is ${code}. Valid for ${OTP_TTL_MINUTES} minutes.`);
  return { sent: true };
}

export async function verifyOtp(identifier: string, code: string): Promise<{ ok: boolean; reason?: string }> {
  const latest = await prisma.otpCode.findFirst({
    where: { identifier, consumed: false },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return { ok: false, reason: "No OTP requested for this identifier." };
  if (latest.expiresAt < new Date()) return { ok: false, reason: "OTP expired, please resend." };
  if (latest.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "Too many attempts. Please request a new OTP." };

  if (latest.code !== code) {
    await prisma.otpCode.update({ where: { id: latest.id }, data: { attempts: { increment: 1 } } });
    const remaining = MAX_ATTEMPTS - (latest.attempts + 1);
    if (remaining <= 0) return { ok: false, reason: "Too many attempts. Please request a new OTP." };
    return { ok: false, reason: `Incorrect code. ${remaining} attempt(s) left.` };
  }

  await prisma.otpCode.update({ where: { id: latest.id }, data: { consumed: true } });
  return { ok: true };
}
