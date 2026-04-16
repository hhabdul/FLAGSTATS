import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Role } from "@/lib/types";

export type AuthProfile = {
  id: string;
  displayName: string;
  username: string;
  role: Role;
  mustChangePassword: boolean;
};

function normalizeRole(role: string | null | undefined): Role {
  return role === "Admin" || role === "Coach" ? role : "Member";
}

export async function getAuthContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, slug, role, must_change_password")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile
      ? ({
          id: profile.id,
          displayName: profile.display_name,
          username: profile.slug,
          role: normalizeRole(profile.role),
          mustChangePassword: profile.must_change_password === true
        } satisfies AuthProfile)
      : null
  };
}

export async function requireAuth() {
  const auth = await getAuthContext();
  if (!auth.user) redirect("/login");
  if (auth.profile?.mustChangePassword) redirect("/complete-account");
  return auth;
}

export async function requireRole(roles: Role[]) {
  const auth = await requireAuth();
  if (!auth.profile || !roles.includes(auth.profile.role)) {
    redirect("/dashboard");
  }
  return auth;
}
