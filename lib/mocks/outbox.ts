import { prisma } from "../db/client";

export type Channel = "EMAIL" | "SMS" | "WHATSAPP";

/**
 * Writes to a local outbox table instead of calling a real provider.
 * Swap this function's body for Twilio/SendGrid/WhatsApp Business API later —
 * every call site in the app only depends on this interface.
 */
export async function sendMessage(channel: Channel, toAddress: string, body: string, subject?: string) {
  await prisma.outboxMessage.create({ data: { channel, toAddress, body, subject } });
  console.log(`[outbox:${channel}] to=${toAddress} ${subject ? `subject="${subject}" ` : ""}body="${body}"`);
}
