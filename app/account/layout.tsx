import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import AccountNav from "@/app/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
      <AccountNav userName={user.name} />
      <div>{children}</div>
    </div>
  );
}
