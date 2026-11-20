import { describe, it, expect } from "vitest";
import { splitExpense, computeBalances, suggestSettlements } from "./engine";

describe("splitExpense", () => {
  it("splits equally with no remainder", () => {
    const shares = splitExpense({
      amountPaise: 300000,
      paidByMemberId: "a",
      participantMemberIds: ["a", "b", "c"],
      splitType: "EQUAL",
    });
    expect(shares).toEqual([
      { memberId: "a", shareAmountPaise: 100000 },
      { memberId: "b", shareAmountPaise: 100000 },
      { memberId: "c", shareAmountPaise: 100000 },
    ]);
    expect(shares.reduce((s, x) => s + x.shareAmountPaise, 0)).toBe(300000);
  });

  it("₹3,000 paid by one member and split among three gives ₹1,000 each", () => {
    const shares = splitExpense({
      amountPaise: 300000, // ₹3,000
      paidByMemberId: "payer",
      participantMemberIds: ["payer", "b", "c"],
      splitType: "EQUAL",
    });
    for (const s of shares) expect(s.shareAmountPaise).toBe(100000); // ₹1,000
  });

  it("hands out remainder paise starting with the payer, in fixed order", () => {
    const shares = splitExpense({
      amountPaise: 100, // 100 paise / 3 = 33 each, remainder 1
      paidByMemberId: "b",
      participantMemberIds: ["a", "b", "c"],
      splitType: "EQUAL",
    });
    const byId = Object.fromEntries(shares.map((s) => [s.memberId, s.shareAmountPaise]));
    expect(byId.b).toBe(34); // payer gets the extra paise first
    expect(byId.a).toBe(33);
    expect(byId.c).toBe(33);
    expect(shares.reduce((s, x) => s + x.shareAmountPaise, 0)).toBe(100);
  });

  it("distributes multiple remainder paise to payer then participant order", () => {
    const shares = splitExpense({
      amountPaise: 103, // /4 = 25 each, remainder 3
      paidByMemberId: "c",
      participantMemberIds: ["a", "b", "c", "d"],
      splitType: "EQUAL",
    });
    const byId = Object.fromEntries(shares.map((s) => [s.memberId, s.shareAmountPaise]));
    // order: c (payer), a, b, d — first 3 get +1
    expect(byId.c).toBe(26);
    expect(byId.a).toBe(26);
    expect(byId.b).toBe(26);
    expect(byId.d).toBe(25);
    expect(shares.reduce((s, x) => s + x.shareAmountPaise, 0)).toBe(103);
  });

  it("accepts custom amounts that add up exactly", () => {
    const shares = splitExpense({
      amountPaise: 1000,
      paidByMemberId: "a",
      participantMemberIds: ["a", "b"],
      splitType: "CUSTOM",
      customShares: { a: 400, b: 600 },
    });
    expect(shares).toEqual([
      { memberId: "a", shareAmountPaise: 400 },
      { memberId: "b", shareAmountPaise: 600 },
    ]);
  });

  it("rejects custom amounts that do not add up", () => {
    expect(() =>
      splitExpense({
        amountPaise: 1000,
        paidByMemberId: "a",
        participantMemberIds: ["a", "b"],
        splitType: "CUSTOM",
        customShares: { a: 400, b: 500 },
      })
    ).toThrow();
  });
});

describe("computeBalances", () => {
  it("balances always sum to zero", () => {
    const balances = computeBalances(
      [
        { id: "e1", amountPaise: 300000, paidByMemberId: "a", participantMemberIds: ["a", "b", "c"], splitType: "EQUAL" },
        { id: "e2", amountPaise: 103, paidByMemberId: "b", participantMemberIds: ["a", "b", "c", "d"], splitType: "EQUAL" },
      ],
      [{ fromMemberId: "c", toMemberId: "a", amountPaise: 50000 }]
    );
    const total = balances.reduce((s, b) => s + b.netPaise, 0);
    expect(total).toBe(0);
  });

  it("gives the payer +amount and each sharer -share for a simple 3-way split", () => {
    const balances = computeBalances(
      [{ id: "e1", amountPaise: 300000, paidByMemberId: "a", participantMemberIds: ["a", "b", "c"], splitType: "EQUAL" }],
      []
    );
    const byId = Object.fromEntries(balances.map((b) => [b.memberId, b.netPaise]));
    expect(byId.a).toBe(200000); // paid 300000, owes self 100000 back -> net +200000 (owed by b and c)
    expect(byId.b).toBe(-100000);
    expect(byId.c).toBe(-100000);
  });

  it("ignores soft-deleted expenses", () => {
    const balances = computeBalances(
      [{ id: "e1", amountPaise: 300000, paidByMemberId: "a", participantMemberIds: ["a", "b", "c"], splitType: "EQUAL", deleted: true }],
      []
    );
    expect(balances.every((b) => b.netPaise === 0)).toBe(true);
  });

  it("settlements move balances correctly", () => {
    const balances = computeBalances(
      [{ id: "e1", amountPaise: 300000, paidByMemberId: "a", participantMemberIds: ["a", "b", "c"], splitType: "EQUAL" }],
      [{ fromMemberId: "b", toMemberId: "a", amountPaise: 100000 }]
    );
    const byId = Object.fromEntries(balances.map((b) => [b.memberId, b.netPaise]));
    expect(byId.b).toBe(0); // fully settled
    expect(byId.a).toBe(100000); // still owed by c
    expect(byId.c).toBe(-100000);
  });
});

describe("suggestSettlements", () => {
  it("clears every balance in a small number of transfers", () => {
    const balances = computeBalances(
      [{ id: "e1", amountPaise: 300000, paidByMemberId: "a", participantMemberIds: ["a", "b", "c"], splitType: "EQUAL" }],
      []
    );
    const suggestions = suggestSettlements(balances);
    // Apply suggestions and check everyone nets to zero.
    const net = new Map(balances.map((b) => [b.memberId, b.netPaise]));
    for (const p of suggestions) {
      net.set(p.fromMemberId, (net.get(p.fromMemberId) ?? 0) + p.amountPaise);
      net.set(p.toMemberId, (net.get(p.toMemberId) ?? 0) - p.amountPaise);
    }
    for (const v of net.values()) expect(v).toBe(0);
    expect(suggestions.length).toBeLessThanOrEqual(2);
  });

  it("returns no suggestions when already settled", () => {
    expect(suggestSettlements([{ memberId: "a", netPaise: 0 }])).toEqual([]);
  });
});
