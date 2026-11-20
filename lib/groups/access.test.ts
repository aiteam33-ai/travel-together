import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { getMembership, requireMembership } from "./access";

// Integration test against the real (local, file-based) SQLite dev database.
// Creates its own rows and cleans them up — safe to run against a dev DB.
const prisma = new PrismaClient();

let groupId: string;
let outsiderUserId: string;
let memberUserId: string;
let tourId: string;

describe("group access rules", () => {
  beforeAll(async () => {
    const tour = await prisma.tour.findFirst();
    if (!tour) throw new Error("Seed the database before running access tests (npm run db:seed)");
    tourId = tour.id;

    const member = await prisma.user.create({ data: { phone: `+91${Date.now()}1` } });
    const outsider = await prisma.user.create({ data: { phone: `+91${Date.now()}2` } });
    memberUserId = member.id;
    outsiderUserId = outsider.id;

    const group = await prisma.group.create({
      data: {
        name: "Access test group",
        organiserUserId: memberUserId,
        tourId,
        members: {
          create: { userId: memberUserId, name: "Member", role: "ORGANISER", status: "JOINED", consentAt: new Date() },
        },
      },
    });
    groupId = group.id;
  });

  afterAll(async () => {
    await prisma.groupMember.deleteMany({ where: { groupId } });
    await prisma.group.delete({ where: { id: groupId } });
    await prisma.user.deleteMany({ where: { id: { in: [memberUserId, outsiderUserId] } } });
    await prisma.$disconnect();
  });

  it("a joined member has a membership", async () => {
    const membership = await getMembership(groupId, memberUserId);
    expect(membership).not.toBeNull();
  });

  it("a non-member has no membership", async () => {
    const membership = await getMembership(groupId, outsiderUserId);
    expect(membership).toBeNull();
  });

  it("requireMembership returns the group and membership for a member", async () => {
    const ctx = await requireMembership(groupId, memberUserId);
    expect(ctx?.group.id).toBe(groupId);
    expect(ctx?.membership.userId).toBe(memberUserId);
  });

  it("requireMembership returns null for a non-member, so callers can 404", async () => {
    const ctx = await requireMembership(groupId, outsiderUserId);
    expect(ctx).toBeNull();
  });

  it("requireMembership returns null for a non-existent group", async () => {
    const ctx = await requireMembership("does-not-exist", memberUserId);
    expect(ctx).toBeNull();
  });

  it("an invited-but-not-joined member does not count as having access", async () => {
    const invitee = await prisma.user.create({ data: { phone: `+91${Date.now()}3` } });
    await prisma.groupMember.create({
      data: { groupId, userId: invitee.id, name: "Invitee", role: "MEMBER", status: "INVITED" },
    });
    const membership = await getMembership(groupId, invitee.id);
    expect(membership).toBeNull();
    await prisma.groupMember.deleteMany({ where: { groupId, userId: invitee.id } });
    await prisma.user.delete({ where: { id: invitee.id } });
  });
});
