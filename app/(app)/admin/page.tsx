import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeader } from "@/components/ui";
import { AdminUserList } from "@/components/admin-user-list";

export default async function AdminPage() {
  await requireRole(["Admin"]);

  const supabase = await createSupabaseServerClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, slug, role")
    .order("display_name");

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Admin" }]} />
      <SectionHeader
        eyebrow="Admin"
        title="Accounts"
        copy="Promote a member to Coach so they can enter and publish match stats. Remove that access anytime. Delete accounts to clean up the roster."
      />
      <AdminUserList profiles={profiles ?? []} />
    </div>
  );
}
