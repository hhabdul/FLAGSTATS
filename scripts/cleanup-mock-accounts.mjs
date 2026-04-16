/**
 * Deletes the old mock/placeholder accounts that were present in the database
 * before the real league bootstrap was run.
 *
 * Run with:  node scripts/cleanup-mock-accounts.mjs
 */

import fs from "node:fs";

function readEnvFile(path) {
  const content = fs.readFileSync(path, "utf8");
  return Object.fromEntries(
    content
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const idx = line.indexOf("=");
        return [line.slice(0, idx), line.slice(idx + 1)];
      })
  );
}

const env = readEnvFile(".env.local");
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  "Content-Type": "application/json"
};

// Slugs that belong to the old placeholder accounts, not real league members.
const MOCK_SLUGS = ["ace-hollow", "jett-cross", "kai-vector", "coach", "miles-rift", "nova-blaze", "onyx-ward"];

async function rest(path, init = {}) {
  const res = await fetch(`${supabaseUrl}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function deleteAuthUser(userId) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers
  });
  return res.ok;
}

async function nullifyProfileRefs(profileId) {
  // Clear foreign keys that don't have ON DELETE CASCADE so the profile row can be deleted.
  await fetch(`${supabaseUrl}/rest/v1/matches?mvp_profile_id=eq.${profileId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ mvp_profile_id: null })
  });
  await fetch(`${supabaseUrl}/rest/v1/matches?top_offense_profile_id=eq.${profileId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ top_offense_profile_id: null })
  });
  await fetch(`${supabaseUrl}/rest/v1/matches?top_defense_profile_id=eq.${profileId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ top_defense_profile_id: null })
  });
  await fetch(`${supabaseUrl}/rest/v1/matches?created_by=eq.${profileId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ created_by: null })
  });
  await fetch(`${supabaseUrl}/rest/v1/team_profiles?captain_profile_id=eq.${profileId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ captain_profile_id: null })
  });
  await fetch(`${supabaseUrl}/rest/v1/match_teams?captain_profile_id=eq.${profileId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ captain_profile_id: null })
  });
  await fetch(`${supabaseUrl}/rest/v1/weekly_summaries?spotlight_profile_id=eq.${profileId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ spotlight_profile_id: null })
  });
  await fetch(`${supabaseUrl}/rest/v1/awards?profile_id=eq.${profileId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ profile_id: null })
  });
}

async function deleteStatRows(profileId) {
  // Delete NOT NULL FK rows that would block profile deletion (no ON DELETE CASCADE).
  await fetch(`${supabaseUrl}/rest/v1/player_match_stats?profile_id=eq.${profileId}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" }
  });
  await fetch(`${supabaseUrl}/rest/v1/match_rosters?profile_id=eq.${profileId}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" }
  });
  await fetch(`${supabaseUrl}/rest/v1/player_season_stats?profile_id=eq.${profileId}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" }
  });
  await fetch(`${supabaseUrl}/rest/v1/comments?author_profile_id=eq.${profileId}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" }
  });
}

async function deleteProfile(profileId) {
  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${profileId}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" }
  });
  return res.ok;
}

async function run() {
  // Fetch all profiles to find the mock ones.
  const profiles = await rest(`/rest/v1/profiles?select=id,display_name,slug&slug=in.(${MOCK_SLUGS.join(",")})`);

  if (!profiles || profiles.length === 0) {
    console.log("No mock accounts found — nothing to delete.");
    return;
  }

  console.log(`Found ${profiles.length} mock account(s) to delete:\n`);

  for (const profile of profiles) {
    console.log(`  Deleting ${profile.display_name} (@${profile.slug}) [${profile.id}]…`);

    // 1. Delete stat/roster rows with NOT NULL FK (no cascade, blocks profile delete).
    await deleteStatRows(profile.id);
    console.log(`    Stat rows: deleted`);

    // 2. Nullify nullable references so the profile row can be deleted.
    await nullifyProfileRefs(profile.id);
    console.log(`    Nullable refs: nullified`);

    // 3. Delete the Supabase auth user (removes login access).
    const authDeleted = await deleteAuthUser(profile.id);
    console.log(`    Auth user: ${authDeleted ? "deleted" : "not found (already gone)"}`);

    // 4. Delete the profile row (cascades to career_stats, badges, etc.).
    const profileDeleted = await deleteProfile(profile.id);
    console.log(`    Profile:   ${profileDeleted ? "deleted" : "failed"}`);
  }

  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
