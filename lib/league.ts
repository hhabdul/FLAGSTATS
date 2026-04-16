import { awards, leaderboardSets, matches, players, seasons, teams, weeklySummaries } from "@/lib/mock-data";
import { Match, Player } from "@/lib/types";

export function getCurrentSeason(allSeasons = seasons) {
  return allSeasons.find((season) => season.status === "Active") ?? allSeasons[0];
}

export function getPlayerById(id: string, allPlayers = players) {
  return allPlayers.find((player) => player.id === id);
}

export function getPlayerBySlug(slug: string, allPlayers = players) {
  return allPlayers.find((player) => player.slug === slug);
}

export function getTeamBySlug(slug: string, allTeams = teams) {
  return allTeams.find((team) => team.slug === slug);
}

export function getMatchById(id: string, allMatches = matches) {
  return allMatches.find((match) => match.id === id);
}

export function getSeasonMatches(seasonId: string, allMatches = matches) {
  return allMatches.filter((match) => match.seasonId === seasonId);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(date)
  );
}

export function aggregatePlayer(playerId: string, allMatches = matches, allPlayers = players) {
  const statLines = allMatches.flatMap((match) => match.statLines.filter((line) => line.playerId === playerId));
  const games = allMatches.filter((match) => match.statLines.some((line) => line.playerId === playerId));
  const fallbackPlayer = allPlayers.find((player) => player.id === playerId);

  if (games.length === 0 && fallbackPlayer?.gamesPlayed !== undefined) {
    const passingTd = fallbackPlayer.passingTd ?? 0;
    const receivingTd = fallbackPlayer.receivingTd ?? 0;
    const rushingTd = fallbackPlayer.rushingTd ?? 0;
    return {
      games: fallbackPlayer.gamesPlayed ?? 0,
      wins: fallbackPlayer.wins ?? 0,
      losses: fallbackPlayer.losses ?? 0,
      winPct: fallbackPlayer.gamesPlayed ? Math.round(((fallbackPlayer.wins ?? 0) / fallbackPlayer.gamesPlayed) * 100) : 0,
      passingTd,
      interceptionsThrown: fallbackPlayer.interceptionsThrown ?? 0,
      receivingTd,
      rushingTd,
      catches: fallbackPlayer.catches ?? 0,
      interceptionsCaught: fallbackPlayer.interceptionsCaught ?? 0,
      passBreakups: fallbackPlayer.passBreakups ?? 0,
      xp: fallbackPlayer.xp ?? 0,
      totalTd: passingTd + receivingTd + rushingTd
    };
  }
  const wins = games.filter((match) => {
    const team = match.teams.find((entry) => entry.playerIds.includes(playerId));
    if (!team) return false;
    const opponent = match.teams.find((entry) => entry.side !== team.side);
    return (opponent?.score ?? 0) < team.score;
  }).length;
  const losses = games.length - wins;
  const totals = statLines.reduce(
    (acc, line) => {
      acc.passingTd += line.passingTd;
      acc.interceptionsThrown += line.interceptionsThrown;
      acc.receivingTd += line.receivingTd;
      acc.rushingTd += line.rushingTd;
      acc.catches += line.catches;
      acc.interceptionsCaught += line.interceptionsCaught;
      acc.passBreakups += line.passBreakups;
      acc.xp += line.xp;
      return acc;
    },
    {
      passingTd: 0,
      interceptionsThrown: 0,
      receivingTd: 0,
      rushingTd: 0,
      catches: 0,
      interceptionsCaught: 0,
      passBreakups: 0,
      xp: 0
    }
  );

  return {
    games: games.length,
    wins,
    losses,
    winPct: games.length ? Math.round((wins / games.length) * 100) : 0,
    ...totals,
    totalTd: totals.passingTd + totals.receivingTd + totals.rushingTd
  };
}

export function getRecentForm(playerId: string, allMatches = matches) {
  return allMatches
    .filter((match) => match.statLines.some((line) => line.playerId === playerId))
    .slice(0, 3)
    .map((match) => ({
      matchId: match.id,
      date: formatDate(match.date),
      impact: match.statLines.find((line) => line.playerId === playerId)
    }));
}

export function getDashboardPayload(allSeasons = seasons, allMatches = matches, allPlayers = players) {
  const currentSeason = getCurrentSeason(allSeasons);
  const featuredMatch = allMatches.find((match) => match.id === currentSeason.featuredMatchId) ?? allMatches[0];
  const mvp = featuredMatch ? getPlayerById(featuredMatch.mvpId, allPlayers) : undefined;
  const spotlight = weeklySummaries.find((summary) => summary.seasonId === currentSeason?.id);

  return {
    currentSeason,
    featuredMatch,
    mvp,
    spotlight,
    awards,
    leaderboardSets,
    recentMatches: allMatches.slice(0, 3)
  };
}

export function buildMatchSummary(match: Match, allPlayers = players) {
  const winner = match.teams[0].score > match.teams[1].score ? match.teams[0] : match.teams[1];
  const loser = match.teams[0].side === winner.side ? match.teams[1] : match.teams[0];
  const mvp = getPlayerById(match.mvpId, allPlayers);
  const offense = getPlayerById(match.topOffenseId, allPlayers);
  const defense = getPlayerById(match.topDefenseId, allPlayers);

  return {
    winner: `${winner.label} defeated ${loser.label} ${winner.score}-${loser.score}`,
    mvp: mvp?.displayName ?? "Not assigned",
    offense: offense?.displayName ?? "Not assigned",
    defense: defense?.displayName ?? "Not assigned",
    play: match.playOfTheGame,
    rankMovement: `${winner.label} +1 power tier`,
    badgesUnlocked: ["Clutch Performer", "Weekly MVP"],
    leaderboardShift: `${offense?.displayName ?? "Top target"} climbed the receiving board`
  };
}

export function comparePlayers(a: Player, b: Player, allMatches = matches, allPlayers = players) {
  const left = aggregatePlayer(a.id, allMatches, allPlayers);
  const right = aggregatePlayer(b.id, allMatches, allPlayers);

  return [
    { label: "Games", left: left.games, right: right.games },
    { label: "Total TD", left: left.totalTd, right: right.totalTd },
    { label: "Catches", left: left.catches, right: right.catches },
    { label: "INT Caught", left: left.interceptionsCaught, right: right.interceptionsCaught },
    { label: "Win %", left: `${left.winPct}%`, right: `${right.winPct}%` },
    { label: "Awards", left: a.mvpAwards + a.offensiveAwards + a.defensiveAwards, right: b.mvpAwards + b.offensiveAwards + b.defensiveAwards }
  ];
}
