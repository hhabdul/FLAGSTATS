import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Panel } from "@/components/ui";
import { CompleteAccountForm } from "@/components/complete-account-form";

export default async function CompleteAccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, must_change_password")
    .eq("id", user.id)
    .maybeSingle();

  // If the account is already set up, send them to the app.
  if (!profile?.must_change_password) {
    redirect("/dashboard");
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <Panel className="w-full max-w-md p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">First login</div>
        <h1 className="mt-3 font-display text-4xl tracking-[-0.03em]">Claim your spot</h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          The league admin set up your account. Pick a display name and set your own password — then you're in.
        </p>
        <CompleteAccountForm defaultDisplayName={profile?.display_name ?? ""} />
      </Panel>
    </div>
  );
}
