import { cache } from "react";

import { awards as mockAwards, badges as mockBadges, leaderboardSets as mockLeaderboardSets, matches as mockMatches, players as mockPlayers, seasons as mockSeasons, teams as mockTeams, weeklySummaries as mockWeeklySummaries } from "@/lib/mock-data";
import { aggregatePlayer } from "@/lib/league";
import { Award, Badge, LeaderboardRow, Match, Player, RankTier, Role, Season, TeamProfile, WeeklySummary } from "@/lib/types";
import { fetchTable, hasSupabaseConfig } from "@/lib/supabase-rest";

type ProfileRow = {
  id: string;
  display_name: string;
  slug: string;
  avatar_url: string | null;
  position: string | null;
  bio: string | null;
  role: string | null;
};

type CareerStatRow = {
  profile_id: string;
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
  current_rank_tier: string | null;
  current_level: number;
};

type SeasonStatRow = {
  season_id: string;
  profile_id: string;
  wins: number;
  losses: number;
  passing_td: number;
  receiving_td: number;
  rushing_td: number;
  catches: number;
  interceptions_caught: number;
  pass_breakups: number;
};

type PlayerBadgeRow = {
  profile_id: string;
  badge_id: string;
  season_id: string | null;
};

type BadgeRow = {
  id: string;
  name: string;
  rarity: Badge["rarity"];
  description: string;
};

type SeasonRow = {
  id: string;
  name: string;
  status: Season["status"];
  week_number: number;
};

type TeamProfileRow = {
  id: string;
  slug: string;
  name: string;
  branding: string | null;
  captain_profile_id: string | null;
  accent_color: string | null;
  secondary_color: string | null;
};

type TeamRecordRow = {
  team_profile_id: string;
  season_id: string | null;
  wins: number;
  losses: number;
  power_rank: number | null;
};

type MatchRow = {
  id: string;
  season_id: string;
  scheduled_at: string;
  venue: string | null;
  status: Match["status"];
  mvp_profile_id: string | null;
  top_offense_profile_id: string | null;
  top_defense_profile_id: string | null;
  play_of_the_game: string | null;
  auto_recap: Record<string, unknown> | null;
  recap_override: Record<string, unknown> | null;
};

type MatchTeamRow = {
  id: string;
  match_id: string;
  team_profile_id: string | null;
  side: "A" | "B";
  label: string;
  captain_profile_id: string | null;
  score: number;
};

type MatchRosterRow = {
  match_team_id: string;
  profile_id: string;
};

type PlayerMatchStatRow = {
  match_id: string;
  profile_id: string;
  passing_td: number;
  interceptions_thrown: number;
  receiving_td: number;
  rushing_td: number;
  catches: number;
  interceptions_caught: number;
  pass_breakups: number;
  xp_earned: number;
};

type CommentRow = {
  match_id: string | null;
  profile_id: string | null;
};

type ReactionRow = {
  match_id: string | null;
  target_profile_id: string | null;
};

type WeeklySummaryRow = {
  id: string;
  season_id: string;
  week_number: number;
  summary: Record<string, unknown> | null;
  featured_match_id: string | null;
  spotlight_profile_id: string | null;
};

type AwardRow = {
  id: string;
  season_id: string | null;
  week_number: number | null;
  category: string;
  title: string;
  profile_id: string | null;
  summary: string | null;
};

export type LeagueData = {
  source: "supabase" | "mock";
  players: Player[];
  teams: TeamProfile[];
  seasons: Season[];
  matches: Match[];
  badges: Badge[];
  awards: Award[];
  weeklySummaries: WeeklySummary[];
  leaderboardSets: Record<string, LeaderboardRow[]>;
};

const rankTiers: RankTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Elite", "Champion", "Legend"];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function normalizeRole(role: string | null | undefined): Role {
  return role === "Admin" || role === "Coach" ? role : "Member";
}

function normalizeTier(value: string | null | undefined): RankTier {
  return rankTiers.find((tier) => tier === value) ?? "Bronze";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getHandle(slug: string, name: string) {
  const base = slug.replace(/-/g, "").toUpperCase();
  return base.slice(0, 8) || name.replace(/\s+/g, "").toUpperCase().slice(0, 8);
}

function readRecap(value: Record<string, unknown> | null | undefined) {
  if (!value) return "";
  if (typeof value.summary === "string") return value.summary;
  if (typeof value.recap === "string") return value.recap;
  return "";
}

function readTimeline(value: Record<string, unknown> | null | undefined, playOfTheGame: string) {
  if (!value) return playOfTheGame ? [playOfTheGame] : [];
  const timeline = value.timeline;
  if (Array.isArray(timeline)) {
    return timeline.filter((item): item is string => typeof item === "string");
  }
  return playOfTheGame ? [playOfTheGame] : [];
}

function getPlayerStreak(playerId: string, matches: Match[]) {
  const relevant = matches
    .filter((match) => match.teams.some((team) => team.playerIds.includes(playerId)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (relevant.length === 0) return "New";

  const outcomes = relevant.map((match) => {
    const team = match.teams.find((entry) => entry.playerIds.includes(playerId));
    const opponent = match.teams.find((entry) => entry.side !== team?.side);
    if (!team || !opponent) return "L";
    return team.score >= opponent.score ? "W" : "L";
  });

  const first = outcomes[0];
  const streak = outcomes.findIndex((result) => result !== first);
  const count = streak === -1 ? outcomes.length : streak;
  return `${first}${Math.max(count, 1)}`;
}

function buildSeasonSummary(seasonId: string, matches: Match[]) {
  const seasonMatches = matches.filter((match) => match.seasonId === seasonId);
  const allTeams = seasonMatches.flatMap((match) => match.teams);
  const allPlayers = new Set(seasonMatches.flatMap((match) => match.teams.flatMap((team) => team.playerIds)));
  const teamScoring: Record<string, { points: number; allowed: number; games: number; label: string }> = {};

  for (const match of seasonMatches) {
    for (const team of match.teams) {
      const opponent = match.teams.find((entry) => entry.side !== team.side);
      if (!teamScoring[team.teamProfileId]) {
        teamScoring[team.teamProfileId] = { points: 0, allowed: 0, games: 0, label: team.label };
      }
      teamScoring[team.teamProfileId].points += team.score;
      teamScoring[team.teamProfileId].allowed += opponent?.score ?? 0;
      teamScoring[team.teamProfileId].games += 1;
    }
  }

  const scoringLeaders = Object.values(teamScoring).sort((a, b) => b.points / Math.max(b.games, 1) - a.points / Math.max(a.games, 1));
  const defenseLeaders = Object.values(teamScoring).sort((a, b) => a.allowed / Math.max(a.games, 1) - b.allowed / Math.max(b.games, 1));

  return {
    totalMatches: seasonMatches.length,
    playersActive: allPlayers.size,
    avgPoints: allTeams.length ? Number((allTeams.reduce((sum, team) => sum + team.score, 0) / allTeams.length).toFixed(1)) : 0,
    bestOffense: scoringLeaders[0]?.label ?? "Open",
    bestDefense: defenseLeaders[0]?.label ?? "Open"
  };
}

function sortRows(rows: LeaderboardRow[]) {
  return rows.slice(0, 8).map((row, index) => ({ ...row, label: String(index + 1) }));
}

function buildLeaderboards(players: Player[], matches: Match[], currentSeasonId: string | undefined, seasonStats: SeasonStatRow[]) {
  const statsByPlayer = new Map<string, SeasonStatRow>();

  for (const row of seasonStats) {
    if (currentSeasonId && row.season_id !== currentSeasonId) continue;
    statsByPlayer.set(row.profile_id, row);
  }

  const source = players.map((player) => {
    const stats = statsByPlayer.get(player.id);
    const aggregate = aggregatePlayer(player.id, matches, players);
    const wins = stats?.wins ?? aggregate.wins;
    const losses = stats?.losses ?? aggregate.losses;
    const catches = stats?.catches ?? aggregate.catches;
    const passingTd = stats?.passing_td ?? aggregate.passingTd;
    const receivingTd = stats?.receiving_td ?? aggregate.receivingTd;
    const rushingTd = stats?.rushing_td ?? aggregate.rushingTd;
    const interceptions = stats?.interceptions_caught ?? aggregate.interceptionsCaught;
    const passBreakups = stats?.pass_breakups ?? aggregate.passBreakups;
    const powerRating = wins * 100 + (passingTd + receivingTd + rushingTd) * 25 + interceptions * 20 + passBreakups * 6 + player.level * 4;

    return {
      player,
      wins,
      losses,
      catches,
      passingTd,
      receivingTd,
      rushingTd,
      interceptions,
      passBreakups,
      powerRating
    };
  });

  return {
    "Overall Power": sortRows(
      source
        .sort((a, b) => b.powerRating - a.powerRating)
        .map((row) => ({
          label: "",
          playerId: row.player.id,
          value: `${row.powerRating.toLocaleString()} PR`,
          change: `${row.wins}-${row.losses}`
        }))
    ),
    "Top Receivers": sortRows(
      source
        .filter((row) => row.catches > 0)
        .sort((a, b) => b.catches - a.catches)
        .map((row) => ({
          label: "",
          playerId: row.player.id,
          value: `${row.catches} catches`,
          change: `${row.receivingTd} rec TD`
        }))
    ),
    "Top QBs": sortRows(
      source
        .filter((row) => row.passingTd > 0)
        .sort((a, b) => b.passingTd - a.passingTd)
        .map((row) => ({
          label: "",
          playerId: row.player.id,
          value: `${row.passingTd} pass TD`,
          change: `${row.wins} wins`
        }))
    ),
    "Top Defenders": sortRows(
      source
        .filter((row) => row.interceptions + row.passBreakups > 0)
        .sort((a, b) => b.interceptions + b.passBreakups - (a.interceptions + a.passBreakups))
        .map((row) => ({
          label: "",
          playerId: row.player.id,
          value: `${row.interceptions + row.passBreakups} impact`,
          change: `${row.interceptions} INT`
        }))
    )
  };
}

function mockLeagueData(): LeagueData {
  return {
    source: "mock",
    players: mockPlayers,
    teams: mockTeams,
    seasons: mockSeasons,
    matches: mockMatches,
    badges: mockBadges,
    awards: mockAwards,
    weeklySummaries: mockWeeklySummaries,
    leaderboardSets: mockLeaderboardSets
  };
}

async function fetchSupabaseLeagueData(): Promise<LeagueData> {
  const [
    profileRows,
    careerRows,
    seasonStatRows,
    playerBadgeRows,
    badgeRows,
    seasonRows,
    teamRows,
    teamRecordRows,
    matchRows,
    matchTeamRows,
    rosterRows,
    statRows,
    weeklySummaryRows,
    awardRows,
    commentRows,
    reactionRows
  ] = await Promise.all([
    fetchTable<ProfileRow>("profiles", { select: "id,display_name,slug,avatar_url,position,bio,role", order: "display_name.asc" }),
    fetchTable<CareerStatRow>("player_career_stats", {
      select:
        "profile_id,games_played,wins,losses,passing_td,interceptions_thrown,receiving_td,rushing_td,catches,interceptions_caught,pass_breakups,mvp_awards,offensive_awards,defensive_awards,xp_total,current_rank_tier,current_level"
    }),
    fetchTable<SeasonStatRow>("player_season_stats", {
      select: "season_id,profile_id,wins,losses,passing_td,receiving_td,rushing_td,catches,interceptions_caught,pass_breakups"
    }),
    fetchTable<PlayerBadgeRow>("player_badges", { select: "profile_id,badge_id,season_id" }),
    fetchTable<BadgeRow>("badges", { select: "id,name,rarity,description", order: "name.asc" }),
    fetchTable<SeasonRow>("seasons", { select: "id,name,status,week_number", order: "starts_on.desc.nullslast,name.desc" }),
    fetchTable<TeamProfileRow>("team_profiles", {
      select: "id,slug,name,branding,captain_profile_id,accent_color,secondary_color",
      order: "name.asc"
    }),
    fetchTable<TeamRecordRow>("team_records", { select: "team_profile_id,season_id,wins,losses,power_rank" }),
    fetchTable<MatchRow>("matches", {
      select:
        "id,season_id,scheduled_at,venue,status,mvp_profile_id,top_offense_profile_id,top_defense_profile_id,play_of_the_game,auto_recap,recap_override",
      order: "scheduled_at.desc"
    }),
    fetchTable<MatchTeamRow>("match_teams", {
      select: "id,match_id,team_profile_id,side,label,captain_profile_id,score",
      order: "match_id.asc,side.asc"
    }),
    fetchTable<MatchRosterRow>("match_rosters", { select: "match_team_id,profile_id", order: "joined_at.asc" }),
    fetchTable<PlayerMatchStatRow>("player_match_stats", {
      select:
        "match_id,profile_id,passing_td,interceptions_thrown,receiving_td,rushing_td,catches,interceptions_caught,pass_breakups,xp_earned"
    }),
    fetchTable<WeeklySummaryRow>("weekly_summaries", {
      select: "id,season_id,week_number,summary,featured_match_id,spotlight_profile_id",
      order: "week_number.desc"
    }),
    fetchTable<AwardRow>("awards", { select: "id,season_id,week_number,category,title,profile_id,summary", order: "week_number.desc.nullslast,title.asc" }),
    fetchTable<CommentRow>("comments", { select: "match_id,profile_id" }),
    fetchTable<ReactionRow>("reactions", { select: "match_id,target_profile_id" })
  ]);

  if (seasonRows.length === 0 || profileRows.length === 0) {
    throw new Error("Supabase project does not contain league records yet.");
  }

  const badgeById = new Map(badgeRows.map((badge) => [badge.id, badge]));
  const badgesByProfile = new Map<string, string[]>();

  for (const row of playerBadgeRows) {
    const badge = badgeById.get(row.badge_id);
    if (!badge) continue;
    badgesByProfile.set(row.profile_id, [...(badgesByProfile.get(row.profile_id) ?? []), badge.name]);
  }

  const commentsByProfile = new Map<string, number>();
  const reactionsByProfile = new Map<string, number>();
  const commentsByMatch = new Map<string, number>();
  const reactionsByMatch = new Map<string, number>();

  for (const row of commentRows) {
    if (row.profile_id) commentsByProfile.set(row.profile_id, (commentsByProfile.get(row.profile_id) ?? 0) + 1);
    if (row.match_id) commentsByMatch.set(row.match_id, (commentsByMatch.get(row.match_id) ?? 0) + 1);
  }

  for (const row of reactionRows) {
    if (row.target_profile_id) reactionsByProfile.set(row.target_profile_id, (reactionsByProfile.get(row.target_profile_id) ?? 0) + 1);
    if (row.match_id) reactionsByMatch.set(row.match_id, (reactionsByMatch.get(row.match_id) ?? 0) + 1);
  }

  const careerByProfile = new Map(careerRows.map((row) => [row.profile_id, row]));
  const activeSeason = seasonRows.find((season) => season.status === "Active") ?? seasonRows[0];
  const relevantTeamRecords = teamRecordRows.filter((row) => row.season_id === activeSeason?.id);
  const latestTeamRecord = new Map<string, TeamRecordRow>();

  for (const row of teamRecordRows) {
    if (!latestTeamRecord.has(row.team_profile_id)) latestTeamRecord.set(row.team_profile_id, row);
  }

  for (const row of relevantTeamRecords) {
    latestTeamRecord.set(row.team_profile_id, row);
  }

  const teams: TeamProfile[] = teamRows.map((row) => {
    const record = latestTeamRecord.get(row.id);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      captainId: row.captain_profile_id ?? "",
      branding: row.branding ?? "",
      accent: row.accent_color ?? "#2E5B88",
      secondary: row.secondary_color ?? "#4E7A6A",
      record: record ? `${record.wins}-${record.losses}` : "0-0",
      powerRank: record?.power_rank ?? 0,
      description: row.branding ?? ""
    };
  });

  const playersBase = profileRows.map((row) => {
    const career = careerByProfile.get(row.id);
    return {
      id: row.id,
      slug: row.slug,
      displayName: row.display_name,
      handle: getHandle(row.slug, row.display_name),
      avatar: getInitials(row.display_name),
      position: row.position ?? "Player",
      role: normalizeRole(row.role),
      bio: row.bio ?? "League profile",
      level: career?.current_level ?? 1,
      xp: career?.xp_total ?? 0,
      tier: normalizeTier(career?.current_rank_tier),
      streak: "Active",
      mvpAwards: career?.mvp_awards ?? 0,
      offensiveAwards: career?.offensive_awards ?? 0,
      defensiveAwards: career?.defensive_awards ?? 0,
      badges: badgesByProfile.get(row.id) ?? [],
      reactions: reactionsByProfile.get(row.id) ?? 0,
      comments: commentsByProfile.get(row.id) ?? 0,
      gamesPlayed: career?.games_played ?? 0,
      wins: career?.wins ?? 0,
      losses: career?.losses ?? 0,
      passingTd: career?.passing_td ?? 0,
      interceptionsThrown: career?.interceptions_thrown ?? 0,
      receivingTd: career?.receiving_td ?? 0,
      rushingTd: career?.rushing_td ?? 0,
      catches: career?.catches ?? 0,
      interceptionsCaught: career?.interceptions_caught ?? 0,
      passBreakups: career?.pass_breakups ?? 0
    } satisfies Player;
  });

  const matchTeamsByMatch = new Map<string, MatchTeamRow[]>();
  for (const row of matchTeamRows) {
    matchTeamsByMatch.set(row.match_id, [...(matchTeamsByMatch.get(row.match_id) ?? []), row]);
  }

  const rostersByMatchTeam = new Map<string, string[]>();
  for (const row of rosterRows) {
    rostersByMatchTeam.set(row.match_team_id, [...(rostersByMatchTeam.get(row.match_team_id) ?? []), row.profile_id]);
  }

  const statsByMatch = new Map<string, PlayerMatchStatRow[]>();
  for (const row of statRows) {
    statsByMatch.set(row.match_id, [...(statsByMatch.get(row.match_id) ?? []), row]);
  }

  const mappedMatches = matchRows
    .map((row): Match | null => {
      const teamRowsForMatch = (matchTeamsByMatch.get(row.id) ?? []).sort((a, b) => a.side.localeCompare(b.side));
      if (teamRowsForMatch.length < 2) return null;

      const teamsForMatch = teamRowsForMatch.slice(0, 2).map((teamRow) => ({
        side: teamRow.side,
        teamProfileId: teamRow.team_profile_id ?? teamRow.id,
        label: teamRow.label,
        captainId: teamRow.captain_profile_id ?? "",
        playerIds: rostersByMatchTeam.get(teamRow.id) ?? [],
        score: teamRow.score
      })) as Match["teams"];

      const statLines = (statsByMatch.get(row.id) ?? []).map((statRow) => ({
        playerId: statRow.profile_id,
        passingTd: statRow.passing_td,
        interceptionsThrown: statRow.interceptions_thrown,
        receivingTd: statRow.receiving_td,
        rushingTd: statRow.rushing_td,
        catches: statRow.catches,
        interceptionsCaught: statRow.interceptions_caught,
        passBreakups: statRow.pass_breakups,
        xp: statRow.xp_earned
      }));

      const playOfTheGame = row.play_of_the_game ?? readRecap(row.auto_recap) ?? "No play submitted yet.";
      const autoRecap = readRecap(row.auto_recap) || `${teamsForMatch[0].label} ${teamsForMatch[0].score} - ${teamsForMatch[1].score} ${teamsForMatch[1].label}`;
      const override = readRecap(row.recap_override);

      return {
        id: row.id,
        seasonId: row.season_id,
        date: row.scheduled_at,
        venue: row.venue ?? "Field TBD",
        status: row.status,
        teams: teamsForMatch,
        mvpId: row.mvp_profile_id ?? "",
        topOffenseId: row.top_offense_profile_id ?? row.mvp_profile_id ?? "",
        topDefenseId: row.top_defense_profile_id ?? "",
        playOfTheGame,
        timeline: readTimeline(row.auto_recap, playOfTheGame),
        comments: commentsByMatch.get(row.id) ?? 0,
        reactions: reactionsByMatch.get(row.id) ?? 0,
        recap: autoRecap,
        recapOverride: override || undefined,
        statLines
      } satisfies Match;
    })
    .filter((match): match is Match => match !== null);

  const matches: Match[] = mappedMatches;

  const players = playersBase.map((player) => ({
    ...player,
    streak: getPlayerStreak(player.id, matches)
  }));

  const seasons = seasonRows.map((row) => {
    const featuredMatchId =
      weeklySummaryRows.find((summary) => summary.season_id === row.id)?.featured_match_id ??
      matches.find((match) => match.seasonId === row.id)?.id ??
      "";

    return {
      id: row.id,
      name: row.name,
      status: row.status,
      week: row.week_number,
      featuredMatchId,
      summary: buildSeasonSummary(row.id, matches)
    } satisfies Season;
  });

  const weeklySummaries: WeeklySummary[] = weeklySummaryRows.map((row) => {
    const summary = row.summary ?? {};
    return {
      id: row.id,
      seasonId: row.season_id,
      title: typeof summary.title === "string" ? summary.title : `Week ${row.week_number} Pulse`,
      spotlightId: row.spotlight_profile_id ?? "",
      gameOfWeek: typeof summary.gameOfWeek === "string" ? summary.gameOfWeek : "Matchup of the week",
      riseId: typeof summary.riseId === "string" ? summary.riseId : "",
      headline: typeof summary.headline === "string" ? summary.headline : "Weekly summary published."
    };
  });

  const awards: Award[] = awardRows.map((row) => ({
    id: row.id,
    title: row.title,
    winnerId: row.profile_id ?? "",
    weekLabel: row.week_number ? `Week ${row.week_number}` : "Season honor",
    category:
      row.category === "Weekly MVP" || row.category === "Offensive" || row.category === "Defensive" || row.category === "Honor"
        ? row.category
        : "Honor",
    summary: row.summary ?? ""
  }));

  const badges: Badge[] = badgeRows.map((row) => ({
    id: row.id,
    name: row.name,
    rarity: row.rarity,
    description: row.description
  }));

  return {
    source: "supabase",
    players,
    teams,
    seasons,
    matches,
    badges,
    awards,
    weeklySummaries,
    leaderboardSets: buildLeaderboards(players, matches, activeSeason?.id, seasonStatRows)
  };
}

export const getLeagueData = cache(async (): Promise<LeagueData> => {
  if (!hasSupabaseConfig) {
    return mockLeagueData();
  }

  try {
    return await fetchSupabaseLeagueData();
  } catch (error) {
    console.warn(`Supabase league data unavailable, falling back to mock data. ${getErrorMessage(error)}`);
    return mockLeagueData();
  }
});
