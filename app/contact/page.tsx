import { BRAND } from "@/lib/brand";
import EnquireButton from "@/app/components/EnquireButton";

export default function ContactPage() {
  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-bold">Contact us</h1>
      <p className="mt-2 text-foreground-muted">
        Call us at {BRAND.supportPhone}, write to {BRAND.supportEmail}, or send an enquiry below.
      </p>
      <div className="mt-4">
        <EnquireButton tourId="" tourTitle="general enquiry" />
      </div>
    </div>
  );
}
