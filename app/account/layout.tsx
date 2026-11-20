import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
      <nav aria-label="Account" className="space-y-1 text-sm">
        <p className="mb-2 font-semibold">Hi, {user.name ?? "there"}</p>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/bookings">Bookings</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/wishlist">Wishlist</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/calculations">Saved calculations</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/travellers">Saved travellers</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/support">Support requests</Link>
        <Link className="block rounded-md px-2 py-1.5 hover:bg-surface" href="/account/profile">Profile</Link>
      </nav>
      <div>{children}</div>
    </div>
  );
}
