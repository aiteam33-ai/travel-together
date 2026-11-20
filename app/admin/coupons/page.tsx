import { prisma } from "@/lib/db/client";
import { formatDateIST } from "@/lib/pricing/format";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { validFrom: "desc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Coupons</h1>
      <table className="mt-4 w-full text-sm">
        <thead><tr className="text-left"><th>Code</th><th>Description</th><th>Discount</th><th>Valid</th><th>Active</th></tr></thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="py-1">{c.code}</td>
              <td>{c.description}</td>
              <td>{c.discountPercent ? `${c.discountPercent}%` : c.discountFlat ? `₹${(c.discountFlat / 100).toLocaleString("en-IN")}` : "—"}</td>
              <td>{formatDateIST(c.validFrom)} – {formatDateIST(c.validTo)}</td>
              <td>{c.active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
