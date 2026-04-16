"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  await requireRole(["Admin"]);

  const supabase = createServiceClient();

  try {
    // 1. Delete stat rows that have NOT NULL FK on profile_id (no cascade)
    await supabase.from("player_match_stats").delete().eq("profile_id", userId);
    await supabase.from("match_rosters").delete().eq("profile_id", userId);
    await supabase.from("player_season_stats").delete().eq("profile_id", userId);
    await supabase.from("comments").delete().eq("author_profile_id", userId);

    // 2. Nullify nullable FK references so rows are kept but unlinked
    await supabase.from("matches").update({ mvp_profile_id: null }).eq("mvp_profile_id", userId);
    await supabase.from("matches").update({ top_offense_profile_id: null }).eq("top_offense_profile_id", userId);
    await supabase.from("matches").update({ top_defense_profile_id: null }).eq("top_defense_profile_id", userId);
    await supabase.from("matches").update({ created_by: null }).eq("created_by", userId);
    await supabase.from("team_profiles").update({ captain_profile_id: null }).eq("captain_profile_id", userId);
    await supabase.from("match_teams").update({ captain_profile_id: null }).eq("captain_profile_id", userId);
    await supabase.from("weekly_summaries").update({ spotlight_profile_id: null }).eq("spotlight_profile_id", userId);
    await supabase.from("awards").update({ profile_id: null }).eq("profile_id", userId);

    // 3. Delete auth user (service role); best-effort — profile-only rows have no auth user
    try {
      await supabase.auth.admin.deleteUser(userId);
    } catch {
      // No auth user (mock/profile-only accounts) — continue with profile deletion
    }

    // 4. Delete profile (cascades career_stats and player_badges)
    await supabase.from("profiles").delete().eq("id", userId);

    revalidatePath("/admin");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export type CareerStatsPatch = {
  games_played: number;
  wins: number;
  losses: number;
  passing_td: number;
  interceptions_thrown: number;
  receiving_td: number;
  rushing_td: number;
  catches: number;
  interceptions_caught: number;
  pass_breakups: number;
  mvp_awards: number;
  offensive_awards: number;
  defensive_awards: number;
  xp_total: number;
  current_level: number;
  current_rank_tier: string | null;
};

export async function updateCareerStats(profileId: string, patch: CareerStatsPatch): Promise<{ error?: string }> {
  await requireRole(["Admin"]);

  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from("player_career_stats")
      .upsert({ profile_id: profileId, ...patch }, { onConflict: "profile_id" });

    if (error) return { error: error.message };

    revalidatePath("/players");
    revalidatePath(`/players/${profileId}`);
    revalidatePath("/leaderboards");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function deleteSeason(seasonId: string): Promise<{ error?: string }> {
  await requireRole(["Admin"]);

  const supabase = createServiceClient();

  try {
    // 1. Nullify weekly_summaries.featured_match_id so match deletion doesn't break it
    await supabase.from("weekly_summaries").update({ featured_match_id: null }).eq("season_id", seasonId);

    // 2. Delete all matches for the season (cascades match_teams → match_rosters → player_match_stats)
    await supabase.from("matches").delete().eq("season_id", seasonId);

    // 3. Delete other season-scoped data with nullable season_id (no auto-cascade)
    await supabase.from("player_season_stats").delete().eq("season_id", seasonId);
    await supabase.from("awards").delete().eq("season_id", seasonId);
    await supabase.from("team_records").delete().eq("season_id", seasonId);
    await supabase.from("player_badges").delete().eq("season_id", seasonId);
    await supabase.from("rank_history").delete().eq("season_id", seasonId);
    await supabase.from("xp_history").delete().eq("season_id", seasonId);

    // 4. Delete the season itself (cascades weekly_summaries via season_id FK)
    const { error: seasonErr } = await supabase.from("seasons").delete().eq("id", seasonId);
    if (seasonErr) return { error: seasonErr.message };

    revalidatePath("/seasons");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
