// Pure, unit-tested expense split and balance engine — the same spirit as
// lib/pricing/engine.ts. All money is whole paise. Balances are always
// derived from expenses + settlements, never stored, so they cannot drift.

export interface ExpenseInput {
  id: string;
  amountPaise: number;
  paidByMemberId: string;
  participantMemberIds: string[]; // order matters for remainder distribution
  splitType: "EQUAL" | "CUSTOM";
  customShares?: Record<string, number>; // memberId -> paise, required for CUSTOM
  deleted?: boolean;
}

export interface SettlementInput {
  fromMemberId: string; // who paid
  toMemberId: string; // who received
  amountPaise: number;
}

export interface MemberShare {
  memberId: string;
  shareAmountPaise: number;
}

/**
 * Splits one expense amongst its participants.
 * - EQUAL: divides evenly; any leftover paise (amount % n) is handed out one
 *   paise at a time, starting with the payer, then in participant order.
 * - CUSTOM: shares must already sum exactly to amountPaise (validated by caller).
 */
export function splitExpense(input: Omit<ExpenseInput, "id" | "deleted">): MemberShare[] {
  const { amountPaise, paidByMemberId, participantMemberIds, splitType, customShares } = input;

  if (splitType === "CUSTOM") {
    if (!customShares) throw new Error("customShares required for CUSTOM split");
    const sum = participantMemberIds.reduce((s, id) => s + (customShares[id] ?? 0), 0);
    if (sum !== amountPaise) {
      throw new Error(`Custom shares (${sum}) must add up to the expense amount (${amountPaise})`);
    }
    return participantMemberIds.map((memberId) => ({ memberId, shareAmountPaise: customShares[memberId] ?? 0 }));
  }

  const n = participantMemberIds.length;
  if (n === 0) return [];
  const base = Math.floor(amountPaise / n);
  const remainder = amountPaise - base * n;

  // Fixed order: payer first, then participants in the order given (excluding payer to avoid double priority).
  const order = [
    ...(participantMemberIds.includes(paidByMemberId) ? [paidByMemberId] : []),
    ...participantMemberIds.filter((id) => id !== paidByMemberId),
  ];

  const extra = new Set(order.slice(0, remainder));
  return participantMemberIds.map((memberId) => ({
    memberId,
    shareAmountPaise: base + (extra.has(memberId) ? 1 : 0),
  }));
}

export interface MemberBalance {
  memberId: string;
  netPaise: number; // positive = is owed money; negative = owes money
}

/**
 * Net balance per member across all (non-deleted) expenses and settlements.
 * Always sums to exactly zero.
 */
export function computeBalances(expenses: ExpenseInput[], settlements: SettlementInput[]): MemberBalance[] {
  const net = new Map<string, number>();
  function add(memberId: string, amount: number) {
    net.set(memberId, (net.get(memberId) ?? 0) + amount);
  }

  for (const expense of expenses) {
    if (expense.deleted) continue;
    const shares = splitExpense(expense);
    add(expense.paidByMemberId, expense.amountPaise); // payer is owed the full amount...
    for (const s of shares) {
      add(s.memberId, -s.shareAmountPaise); // ...minus everyone's share, including their own
    }
  }

  for (const s of settlements) {
    // fromMemberId paid toMemberId: reduces what `from` owes (or increases what they're owed),
    // and reduces what `to` is owed (or increases what they owe).
    add(s.fromMemberId, s.amountPaise);
    add(s.toMemberId, -s.amountPaise);
  }

  return Array.from(net.entries()).map(([memberId, netPaise]) => ({ memberId, netPaise }));
}

export interface SuggestedPayment {
  fromMemberId: string;
  toMemberId: string;
  amountPaise: number;
}

/**
 * Greedy min-transaction settlement suggestion: repeatedly match the
 * largest debtor with the largest creditor. Not guaranteed minimal in every
 * case, but always clears every balance in a small number of transfers.
 */
export function suggestSettlements(balances: MemberBalance[]): SuggestedPayment[] {
  const debtors = balances.filter((b) => b.netPaise < 0).map((b) => ({ ...b })).sort((a, b) => a.netPaise - b.netPaise);
  const creditors = balances.filter((b) => b.netPaise > 0).map((b) => ({ ...b })).sort((a, b) => b.netPaise - a.netPaise);

  const payments: SuggestedPayment[] = [];
  let di = 0;
  let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(-debtor.netPaise, creditor.netPaise);
    if (amount > 0) {
      payments.push({ fromMemberId: debtor.memberId, toMemberId: creditor.memberId, amountPaise: amount });
      debtor.netPaise += amount;
      creditor.netPaise -= amount;
    }
    if (debtor.netPaise === 0) di++;
    if (creditor.netPaise === 0) ci++;
  }
  return payments;
}
