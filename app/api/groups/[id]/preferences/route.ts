import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { requireMembership } from "@/lib/groups/access";
import { addSystemFeedEntry } from "@/lib/groups/feed";
import { INTEREST_CHIPS, FOOD_PREFERENCES, STAY_PREFERENCES } from "@/lib/pricing/constants";

// Secret budgets are never returned to anyone but their own owner. The group
// only ever sees the aggregated comfort range (min/max of members who set
// one) and a "N of M shared" completion count — never per-member figures,
// never in this route's response, and never logged.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [members, preferences] = await Promise.all([
    prisma.groupMember.findMany({ where: { groupId: id, status: "JOINED" } }),
    prisma.memberPreference.findMany({ where: { member: { groupId: id, status: "JOINED" } } }),
  ]);

  const mine = preferences.find((p) => p.memberId === ctx.membership.id) ?? null; // includes fitnessSelfRating — private, own-only below too

  const others = preferences
    .filter((p) => p.memberId !== ctx.membership.id)
    .map((p) => ({
      memberId: p.memberId,
      pace: p.pace,
      interests: p.interests,
      foodPreference: p.foodPreference,
      stayPreference: p.stayPreference,
      // secretBudgetPaise intentionally omitted
    }));

  const budgets = preferences.map((p) => p.secretBudgetPaise).filter((b): b is number => b != null);
  const comfortRange = budgets.length
    ? { minPaise: Math.min(...budgets), maxPaise: Math.max(...budgets) }
    : null;

  return NextResponse.json({
    mine,
    others,
    sharedCount: preferences.length,
    totalMembers: members.length,
    comfortRange,
  });
}

const schema = z.object({
  pace: z.number().int().min(1).max(5).optional(),
  interests: z.array(z.enum(INTEREST_CHIPS)).max(INTEREST_CHIPS.length).optional(),
  foodPreference: z.enum(FOOD_PREFERENCES).optional(),
  stayPreference: z.enum(STAY_PREFERENCES).optional(),
  secretBudgetPaise: z.number().int().min(0).optional(),
  fitnessSelfRating: z.number().int().min(1).max(5).optional(),
});

// Partial update — only the fields actually sent are changed (e.g. the
// fitness self-assessment slider on Trek Essentials saves on its own
// without touching the rest of this member's Vibe Check answers).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });

  const { interests, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (interests) updateData.interests = interests.join(",");

  await prisma.memberPreference.upsert({
    where: { memberId: ctx.membership.id },
    create: { memberId: ctx.membership.id, pace: parsed.data.pace ?? 3, interests: interests?.join(",") ?? "", ...rest },
    update: updateData,
  });

  return NextResponse.json({ ok: true });
}

// A lightweight nudge posted to the group chat — no per-member targeting,
// no indication of who specifically hasn't shared yet (privacy: completion
// status per member isn't exposed either).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const ctx = await requireMembership(id, user.id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await addSystemFeedEntry(id, `${user.name} nudged the group to share their Vibe Check preferences.`);
  return NextResponse.json({ ok: true });
}
