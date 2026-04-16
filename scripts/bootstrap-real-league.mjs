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

const seasonId = "10000000-0000-0000-0000-000000002026";
const teamBeydounId = "20000000-0000-0000-0000-000000002026";
const teamZalghoutId = "20000000-0000-0000-0000-000000002027";

const adminAccount = {
  username: "admin",
  displayName: "League Admin",
  role: "Admin",
  password: "Password"
};

const members = [
  { username: "hussein", displayName: "Hussein Abdullah", stats: { games_played: 1, passing_td: 0, interceptions_thrown: 0, receiving_td: 2, rushing_td: 0, catches: 0, interceptions_caught: 0, pass_breakups: 0 } },
  { username: "curly", displayName: "Curly", stats: { games_played: 2, passing_td: 0, interceptions_thrown: 0, receiving_td: 1, rushing_td: 0, catches: 0, interceptions_caught: 0, pass_breakups: 0 } },
  { username: "noon", displayName: "Noon", stats: { games_played: 2, passing_td: 0, interceptions_thrown: 0, receiving_td: 3, rushing_td: 0, catches: 0, interceptions_caught: 1, pass_breakups: 1 } },
  { username: "mostafa", displayName: "Mostafa Alhuchem", stats: { games_played: 2, passing_td: 0, interceptions_thrown: 0, receiving_td: 7, rushing_td: 0, catches: 0, interceptions_caught: 0, pass_breakups: 4 } },
  { username: "muslim", displayName: "Muslim Alkaabi", stats: { games_played: 1, passing_td: 0, interceptions_thrown: 0, receiving_td: 2, rushing_td: 0, catches: 0, interceptions_caught: 0, pass_breakups: 1 } },
  { username: "alibaydoun", displayName: "Ali Baydoun", stats: { games_played: 1, passing_td: 0, interceptions_thrown: 0, receiving_td: 2, rushing_td: 0, catches: 0, interceptions_caught: 0, pass_breakups: 0 } },
  { username: "joe", displayName: "Joe Baydoun", stats: { games_played: 2, passing_td: 0, interceptions_thrown: 0, receiving_td: 1, rushing_td: 0, catches: 0, interceptions_caught: 0, pass_breakups: 0 } },
  { username: "alex", displayName: "Alex Bazzi", stats: { games_played: 2, passing_td: 0, interceptions_thrown: 0, receiving_td: 3, rushing_td: 0, catches: 0, interceptions_caught: 1, pass_breakups: 2 } },
  { username: "alibeydoun", displayName: "Ali Beydoun", stats: { games_played: 2, passing_td: 17, interceptions_thrown: 3, receiving_td: 0, rushing_td: 2, catches: 0, interceptions_caught: 1, pass_breakups: 1 } },
  { username: "alikobeissi", displayName: "Ali Kobeissi", stats: { games_played: 1, passing_td: 0, interceptions_thrown: 0, receiving_td: 1, rushing_td: 0, catches: 0, interceptions_caught: 1, pass_breakups: 0 } },
  { username: "alimansour", displayName: "Ali Mansour", stats: { games_played: 2, passing_td: 0, interceptions_thrown: 0, receiving_td: 5, rushing_td: 0, catches: 0, interceptions_caught: 0, pass_breakups: 1 } },
  { username: "abe", displayName: "Abe Omar", stats: { games_played: 1, passing_td: 0, interceptions_thrown: 0, receiving_td: 2, rushing_td: 0, catches: 0, interceptions_caught: 0, pass_breakups: 2 } },
  { username: "hadi", displayName: "Hadi Zalghout", stats: { games_played: 2, passing_td: 12, interceptions_thrown: 1, receiving_td: 0, rushing_td: 3, catches: 0, interceptions_caught: 0, pass_breakups: 1 } }
];

const badges = [
  { slug: "weekly-mvp", name: "Weekly MVP", rarity: "Epic", description: "Earn the weekly top performance." },
  { slug: "playmaker", name: "Playmaker", rarity: "Rare", description: "Create multiple scores in one session." },
  { slug: "lockdown", name: "Lockdown", rarity: "Rare", description: "Stack defensive stops across the season." }
];

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  "Content-Type": "application/json"
};

async function adminFetch(path, init = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text}`);
  }

  return response.headers.get("content-type")?.includes("application/json") ? response.json() : response.text();
}

async function adminFetchWithRetry(path, init = {}, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await adminFetch(path, init);
    } catch (error) {
      const is5xx = error.message?.startsWith("502") || error.message?.startsWith("503") || error.message?.startsWith("504");
      if (is5xx && attempt < retries - 1) {
        const delay = 1000 * (attempt + 1);
        console.warn(`  Retrying after ${delay}ms (${error.message.slice(0, 40)})…`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
}

async function findAuthUserByEmail(email) {
  // Fetch a small page and look for the email; enough for any reasonable league size.
  const result = await adminFetchWithRetry(`/auth/v1/admin/users?page=1&per_page=100`);
  const users = result.users || [];
  return users.find((u) => u.email === email) ?? null;
}

async function ensureAuthUser({ username, displayName, role, password }) {
  const email = `${username}@flagstats.local`;

  try {
    const created = await adminFetchWithRetry("/auth/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          display_name: displayName,
          role,
          must_change_password: true
        }
      })
    });
    return created.id;
  } catch (error) {
    // User probably already exists — look them up by email.
    const existing = await findAuthUserByEmail(email);
    if (existing) return existing.id;
    throw error;
  }
}

async function upsert(table, rows, onConflict) {
  const query = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : "";
  return adminFetch(`/rest/v1/${table}${query}`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(rows)
  });
}

async function seedLeague() {
  const adminId = await ensureAuthUser({ ...adminAccount });
  const membersWithIds = [];

  for (const member of members) {
    const id = await ensureAuthUser({
      username: member.username,
      displayName: member.displayName,
      role: "Member",
      password: "Password"
    });
    membersWithIds.push({ ...member, id });
  }

  const allProfiles = [
    {
      id: adminId,
      display_name: adminAccount.displayName,
      slug: adminAccount.username,
      position: "Admin",
      bio: "Primary league administrator account.",
      role: "Admin",
      must_change_password: true
    },
    ...membersWithIds.map((member) => ({
      id: member.id,
      display_name: member.displayName,
      slug: member.username,
      position: "Member",
      bio: "League member account.",
      role: "Member",
      must_change_password: true
    }))
  ];

  const aliBeydounId = membersWithIds.find((member) => member.username === "alibeydoun")?.id;
  const hadiId = membersWithIds.find((member) => member.username === "hadi")?.id;
  const aliMansourId = membersWithIds.find((member) => member.username === "alimansour")?.id;
  const mostafaId = membersWithIds.find((member) => member.username === "mostafa")?.id;

  await upsert("profiles", allProfiles, "id");
  await upsert("badges", badges.map((badge) => ({ ...badge, xp_bonus: 0 })), "slug");
  await upsert(
    "seasons",
    [
      {
        id: seasonId,
        name: "2026 Flag Football Sunday",
        status: "Active",
        week_number: 2
      }
    ],
    "id"
  );
  await upsert(
    "team_profiles",
    [
      {
        id: teamBeydounId,
        slug: "team-beydoun",
        name: "Team Beydoun",
        branding: "Week-to-week squad led by Ali Beydoun.",
        captain_profile_id: aliBeydounId ?? null,
        accent_color: "#2E5B88",
        secondary_color: "#4E7A6A"
      },
      {
        id: teamZalghoutId,
        slug: "team-zalghout",
        name: "Team Zalghout",
        branding: "Week-to-week squad led by Hadi Zalghout.",
        captain_profile_id: hadiId ?? null,
        accent_color: "#4E7A6A",
        secondary_color: "#2E5B88"
      }
    ],
    "id"
  );

  await upsert(
    "matches",
    [
      {
        id: "40000000-0000-0000-0000-000000002001",
        season_id: seasonId,
        scheduled_at: "2026-03-29T12:00:00Z",
        venue: "Flag Football Sunday",
        status: "Final",
        mvp_profile_id: aliMansourId ?? null,
        top_offense_profile_id: aliMansourId ?? null,
        top_defense_profile_id: null,
        play_of_the_game: "Beydoun 50 yard RUSH TD off pitch",
        auto_recap: {
          summary: "Team Beydoun beat Team Zalghout 8-6 in Week 1.",
          timeline: ["Week 1 player of the game: Ali Mansour (3 REC TDS)."]
        },
        created_by: adminId
      },
      {
        id: "40000000-0000-0000-0000-000000002002",
        season_id: seasonId,
        scheduled_at: "2026-04-05T12:00:00Z",
        venue: "Flag Football Sunday",
        status: "Final",
        mvp_profile_id: mostafaId ?? null,
        top_offense_profile_id: mostafaId ?? null,
        top_defense_profile_id: null,
        play_of_the_game: "ALDOUN 40 yard diving catch",
        auto_recap: {
          summary: "Team Beydoun and Team Zalghout finished tied 11-11 in Week 2.",
          timeline: ["Week 2 player of the game: Mostafa Alhuchem (5 REC TDS)."]
        },
        created_by: adminId
      }
    ],
    "id"
  );

  await upsert(
    "match_teams",
    [
      { id: "50000000-0000-0000-0000-000000002011", match_id: "40000000-0000-0000-0000-000000002001", team_profile_id: teamBeydounId, side: "A", label: "Team Beydoun", captain_profile_id: aliBeydounId ?? null, score: 8 },
      { id: "50000000-0000-0000-0000-000000002012", match_id: "40000000-0000-0000-0000-000000002001", team_profile_id: teamZalghoutId, side: "B", label: "Team Zalghout", captain_profile_id: hadiId ?? null, score: 6 },
      { id: "50000000-0000-0000-0000-000000002021", match_id: "40000000-0000-0000-0000-000000002002", team_profile_id: teamBeydounId, side: "A", label: "Team Beydoun", captain_profile_id: aliBeydounId ?? null, score: 11 },
      { id: "50000000-0000-0000-0000-000000002022", match_id: "40000000-0000-0000-0000-000000002002", team_profile_id: teamZalghoutId, side: "B", label: "Team Zalghout", captain_profile_id: hadiId ?? null, score: 11 }
    ],
    "id"
  );

  await upsert(
    "player_career_stats",
    membersWithIds.map((member) => ({
      profile_id: member.id,
      games_played: member.stats.games_played,
      wins: 0,
      losses: 0,
      passing_td: member.stats.passing_td,
      interceptions_thrown: member.stats.interceptions_thrown,
      receiving_td: member.stats.receiving_td,
      rushing_td: member.stats.rushing_td,
      catches: member.stats.catches,
      interceptions_caught: member.stats.interceptions_caught,
      pass_breakups: member.stats.pass_breakups,
      mvp_awards: member.id === aliMansourId || member.id === mostafaId ? 1 : 0,
      offensive_awards: 0,
      defensive_awards: 0,
      xp_total: member.stats.games_played * 100 + member.stats.receiving_td * 40 + member.stats.passing_td * 15 + member.stats.rushing_td * 35,
      current_rank_tier: member.stats.passing_td >= 10 ? "Champion" : member.stats.receiving_td >= 5 ? "Elite" : "Gold",
      current_level: Math.max(1, member.stats.games_played)
    })),
    "profile_id"
  );

  await upsert(
    "player_season_stats",
    membersWithIds.map((member) => ({
      season_id: seasonId,
      profile_id: member.id,
      games_played: member.stats.games_played,
      wins: 0,
      losses: 0,
      passing_td: member.stats.passing_td,
      interceptions_thrown: member.stats.interceptions_thrown,
      receiving_td: member.stats.receiving_td,
      rushing_td: member.stats.rushing_td,
      catches: member.stats.catches,
      interceptions_caught: member.stats.interceptions_caught,
      pass_breakups: member.stats.pass_breakups,
      mvp_awards: member.id === aliMansourId || member.id === mostafaId ? 1 : 0,
      offensive_awards: 0,
      defensive_awards: 0,
      xp_total: member.stats.games_played * 100 + member.stats.receiving_td * 40 + member.stats.passing_td * 15 + member.stats.rushing_td * 35,
      rank_tier: member.stats.passing_td >= 10 ? "Champion" : member.stats.receiving_td >= 5 ? "Elite" : "Gold",
      level: Math.max(1, member.stats.games_played)
    })),
    "season_id,profile_id"
  );

  await upsert(
    "team_records",
    [
      { id: "60000000-0000-0000-0000-000000002026", team_profile_id: teamBeydounId, season_id: seasonId, wins: 1, losses: 0, points_for: 19, points_against: 17, power_rank: 1 },
      { id: "60000000-0000-0000-0000-000000002027", team_profile_id: teamZalghoutId, season_id: seasonId, wins: 0, losses: 1, points_for: 17, points_against: 19, power_rank: 2 }
    ],
    "id"
  );

  await upsert(
    "awards",
    [
      { id: "70000000-0000-0000-0000-000000002001", season_id: seasonId, week_number: 1, category: "Weekly MVP", title: "Week 1 Player of the Game", profile_id: aliMansourId ?? null, summary: "Ali Mansour recorded 3 receiving TDs." },
      { id: "70000000-0000-0000-0000-000000002002", season_id: seasonId, week_number: 2, category: "Weekly MVP", title: "Week 2 Player of the Game", profile_id: mostafaId ?? null, summary: "Mostafa Alhuchem recorded 5 receiving TDs." }
    ],
    "id"
  );

  await upsert(
    "weekly_summaries",
    [
      {
        id: "80000000-0000-0000-0000-000000002001",
        season_id: seasonId,
        week_number: 1,
        summary: { title: "Week 1 Summary", gameOfWeek: "Team Beydoun vs Team Zalghout", headline: "Team Beydoun opened the season with an 8-6 win." },
        featured_match_id: "40000000-0000-0000-0000-000000002001",
        spotlight_profile_id: aliMansourId ?? null
      },
      {
        id: "80000000-0000-0000-0000-000000002002",
        season_id: seasonId,
        week_number: 2,
        summary: { title: "Week 2 Summary", gameOfWeek: "Team Beydoun vs Team Zalghout", headline: "The teams battled to an 11-11 tie." },
        featured_match_id: "40000000-0000-0000-0000-000000002002",
        spotlight_profile_id: mostafaId ?? null
      }
    ],
    "id"
  );

  console.log("Admin account:");
  console.log("  username: admin");
  console.log("  password: Password");
  console.log("Member accounts:");
  for (const member of membersWithIds) {
    console.log(`  ${member.displayName}: ${member.username} / Password`);
  }
}

seedLeague().catch((error) => {
  console.error(error);
  process.exit(1);
});
