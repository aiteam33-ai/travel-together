"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthContext";

export default function LogoutButtons() {
  const router = useRouter();
  const { logout } = useAuth();

  async function doLogout(all: boolean) {
    await logout(all);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mt-4 flex gap-2">
      <button type="button" onClick={() => doLogout(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
        Log out
      </button>
      <button type="button" onClick={() => doLogout(true)} className="rounded-md border border-danger px-4 py-2 text-sm font-semibold text-danger">
        Log out of all devices
      </button>
    </div>
  );
}
