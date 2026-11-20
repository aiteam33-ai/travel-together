import { BRAND } from "@/lib/brand";

export default function PrivacyPage() {
  return (
    <article className="prose max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">Privacy notice</h1>
      <p className="mt-4 text-foreground-muted">
        {BRAND.name} collects your name, mobile number or email, and booking details to process enquiries,
        bookings and payments, in line with India&apos;s Digital Personal Data Protection (DPDP) Act, 2023.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground-muted">
        <li>We never collect Aadhaar numbers.</li>
        <li>PAN is collected only for overseas bookings, for tax reporting purposes.</li>
        <li>Passport details are collected only for international tours and stored for visa processing.</li>
        <li>You can request a copy or deletion of your data by writing to {BRAND.supportEmail}.</li>
        <li>We do not sell your personal data to third parties.</li>
      </ul>
    </article>
  );
}
