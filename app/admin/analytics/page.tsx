import { prisma } from "@/lib/db/client";

async function countEvent(type: string) {
  return prisma.productEvent.count({ where: { type } });
}

export default async function AdminAnalyticsPage() {
  const [
    calculatorUsed,
    groupsCreated,
    invitesSent,
    invitesAccepted,
    expensesAdded,
    checkoutStarted,
    bookingConfirmed,
    totalGroups,
    groupsWithInvite,
    groupsWithExpense,
    tourCount,
  ] = await Promise.all([
    countEvent("CALCULATOR_USED"),
    countEvent("GROUP_CREATED"),
    countEvent("INVITE_SENT"),
    countEvent("INVITE_ACCEPTED"),
    countEvent("EXPENSE_ADDED"),
    countEvent("CHECKOUT_STARTED"),
    countEvent("BOOKING_CONFIRMED"),
    prisma.group.count(),
    prisma.productEvent.groupBy({ by: ["metadataJson"], where: { type: "INVITE_SENT" } }).then((rows) => {
      const groupIds = new Set(rows.map((r) => (r.metadataJson ? JSON.parse(r.metadataJson).groupId : null)).filter(Boolean));
      return groupIds.size;
    }),
    prisma.expense.groupBy({ by: ["groupId"], where: { deletedAt: null } }).then((rows) => rows.length),
    prisma.tour.count(),
  ]);

  const pct = (n: number, d: number) => (d === 0 ? "—" : `${Math.round((n / d) * 100)}%`);

  const rows = [
    { label: "Calculator uses (total)", value: calculatorUsed },
    { label: "Calculator uses per tour (avg — no page-view tracking yet)", value: tourCount > 0 ? (calculatorUsed / tourCount).toFixed(1) : "—" },
    { label: "Groups created", value: groupsCreated },
    { label: "Share of group creators who invite someone", value: pct(groupsWithInvite, totalGroups) },
    { label: "Invite-to-join rate", value: pct(invitesAccepted, invitesSent) },
    { label: "Share of groups with at least one expense", value: pct(groupsWithExpense, totalGroups) },
    { label: "Checkout completion (started → confirmed)", value: pct(bookingConfirmed, checkoutStarted) },
    { label: "Expenses added (total)", value: expensesAdded },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Product analytics</h1>
      <p className="text-sm text-foreground-muted">
        Derived from recorded product events (calculator used, group created, invite sent/accepted, expense added,
        checkout started, booking confirmed) and current group/expense data.
      </p>
      <table className="mt-4 w-full max-w-xl text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-border">
              <td className="py-2">{r.label}</td>
              <td className="py-2 text-right font-semibold">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
