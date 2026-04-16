import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth";

export default async function LeagueLayout({ children }: { children: ReactNode }) {
  const auth = await requireAuth();

  return <AppShell currentUser={auth.profile}>{children}</AppShell>;
}
