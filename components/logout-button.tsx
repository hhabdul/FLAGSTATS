"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="min-h-11 rounded-[14px] bg-black/[0.05] px-3 py-2 text-sm font-semibold text-ink-primary transition hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
    >
      Logout
    </button>
  );
}
