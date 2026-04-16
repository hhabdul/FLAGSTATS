import { revalidatePath } from "next/cache";

import { requireAuth, requireRole } from "@/lib/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MetricTile, Panel, Pill, SectionHeader } from "@/components/ui";
import { LogoutButton } from "@/components/logout-button";
import { getLeagueData } from "@/lib/league-data";
import { Role } from "@/lib/types";

export default async function MorePage() {
  const auth = await requireAuth();
  const league = await getLeagueData();
  const isAdmin = auth.profile?.role === "Admin";

  async function updateRole(formData: FormData) {
    "use server";

    await requireRole(["Admin"]);
    const profileId = String(formData.get("profileId") ?? "");
    const nextRole = String(formData.get("nextRole") ?? "") as Role;

    if (!profileId || (nextRole !== "Coach" && nextRole !== "Member")) return;

    const supabase = await createSupabaseServerClient();
    await supabase.from("profiles").update({ role: nextRole }).eq("id", profileId);
    revalidatePath("/more");
  }

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "More" }]} />
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          eyebrow="More"
          title="Everything else"
          copy="League settings, team info, and badges — useful stuff that doesn't need to live in the main nav."
        />
        <div className="shrink-0 pt-1 lg:hidden">
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Quick settings</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricTile label="Theme" value="Light / Dark" hint="Toggle between light and dark using the button in the nav." />
            <MetricTile label="Roles" value="Admin · Coach · Member" hint="Coaches can enter and publish match stats. Admins manage everything." />
            <MetricTile label="Season" value="Per-game selection" hint="Season is chosen each time you enter a game — no global switch needed." />
            <MetricTile label="Your access" value={auth.profile?.role === "Admin" || auth.profile?.role === "Coach" ? "Game entry enabled" : "View only"} hint={auth.profile?.role === "Admin" || auth.profile?.role === "Coach" ? "You can enter and publish match stats." : "Ask an admin to promote you to Coach for stat entry access."} />
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Optional extras</div>
          <div className="mt-4 space-y-3">
            <details className="rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 p-4 dark:bg-surface-3">
              <summary className="cursor-pointer list-none font-semibold">Admin tools</summary>
              {isAdmin ? (
                <div className="mt-3 space-y-3">
                  <div className="text-sm text-ink-muted">Coaches can enter and publish match stats. Use the full admin panel at <a href="/admin" className="underline">/admin</a> to manage roles and delete accounts.</div>
                  <div className="space-y-2">
                    {league.players.map((player) => {
                      if (player.role === "Admin") {
                        return (
                          <div key={player.id} className="flex items-center justify-between rounded-[16px] bg-black/[0.04] px-4 py-3 text-sm dark:bg-white/[0.06]">
                            <div>
                              <div className="font-semibold">{player.displayName}</div>
                              <div className="text-xs uppercase tracking-[0.14em] text-ink-muted">{player.role}</div>
                            </div>
                            <Pill tone="gold">Admin</Pill>
                          </div>
                        );
                      }

                      const nextRole: Role = player.role === "Coach" ? "Member" : "Coach";

                      return (
                        <form key={player.id} action={updateRole} className="flex items-center justify-between gap-3 rounded-[16px] bg-black/[0.04] px-4 py-3 text-sm dark:bg-white/[0.06]">
                          <input type="hidden" name="profileId" value={player.id} />
                          <input type="hidden" name="nextRole" value={nextRole} />
                          <div>
                            <div className="font-semibold">{player.displayName}</div>
                            <div className="text-xs uppercase tracking-[0.14em] text-ink-muted">{player.role}</div>
                          </div>
                          <button type="submit" className="min-h-10 rounded-[14px] bg-accent-cyan px-3 py-2 text-sm font-semibold text-white">
                            {nextRole === "Coach" ? "Make coach" : "Make member"}
                          </button>
                        </form>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-ink-muted">
                  Only admins can manage roles. Members browse, coaches enter stats — ask your admin for an upgrade.
                </div>
              )}
            </details>

            <details className="rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 p-4 dark:bg-surface-3">
              <summary className="cursor-pointer list-none font-semibold">Team brands</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {league.teams.map((team) => (
                  <Pill key={team.id} tone="muted">
                    {team.name}
                  </Pill>
                ))}
              </div>
            </details>

            <details className="rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 p-4 dark:bg-surface-3">
              <summary className="cursor-pointer list-none font-semibold">Badges</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {league.badges.slice(0, 8).map((badge) => (
                  <Pill key={badge.id} tone={badge.rarity === "Legendary" ? "gold" : badge.rarity === "Epic" ? "hot" : "lime"}>
                    {badge.name}
                  </Pill>
                ))}
              </div>
            </details>
          </div>
        </Panel>
      </div>
    </div>
  );
}
