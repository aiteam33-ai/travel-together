import { BRAND } from "@/lib/brand";
import { prisma } from "@/lib/db/client";
import { FooterCompanyLinks, FooterPolicyLinks, FooterBranchesHeading } from "./FooterLinks";

export default async function Footer() {
  const branches = await prisma.branch.findMany();
  return (
    <footer className="mt-16 border-t border-border bg-surface print:hidden">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 py-10 md:grid-cols-4">
        <div>
          <p className="font-heading text-lg font-bold text-accent">{BRAND.shortName}</p>
          <p className="mt-2 text-sm text-foreground-muted">{BRAND.tagline}</p>
          <p className="mt-3 text-sm">{BRAND.supportPhone}</p>
          <p className="text-sm">{BRAND.supportEmail}</p>
        </div>
        <FooterCompanyLinks />
        <FooterPolicyLinks />
        <div>
          <FooterBranchesHeading />
          <ul className="mt-2 space-y-1 text-sm text-foreground-muted">
            {branches.slice(0, 4).map((b) => (
              <li key={b.id}>{b.city}: {b.phone}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-border px-6 py-4 text-center text-xs text-foreground-muted">
        © {new Date().getFullYear()} {BRAND.name}. GSTIN {BRAND.gstin}. All tours subject to availability.
      </p>
    </footer>
  );
}
