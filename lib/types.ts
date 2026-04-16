export type Role = "Admin" | "Coach" | "Member";
export type RankTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Elite"
  | "Champion"
  | "Legend";

export type Player = {
  id: string;
  slug: string;
  displayName: string;
  handle: string;
  avatar: string;
  position: string;
  role: Role;
  bio: string;
  level: number;
  xp: number;
  tier: RankTier;
  streak: string;
  mvpAwards: number;
  offensiveAwards: number;
  defensiveAwards: number;
  badges: string[];
  reactions: number;
  comments: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  passingTd?: number;
  interceptionsThrown?: number;
  receivingTd?: number;
  rushingTd?: number;
  catches?: number;
  interceptionsCaught?: number;
  passBreakups?: number;
};

export type TeamProfile = {
  id: string;
  slug: string;
  name: string;
  captainId: string;
  branding: string;
  accent: string;
  secondary: string;
  record: string;
  powerRank: number;
  description: string;
};

export type Season = {
  id: string;
  name: string;
  status: "Active" | "Completed" | "Upcoming";
  week: number;
  featuredMatchId: string;
  summary: {
    totalMatches: number;
    playersActive: number;
    avgPoints: number;
    bestOffense: string;
    bestDefense: string;
  };
};

export type MatchTeam = {
  side: "A" | "B";
  teamProfileId: string;
  label: string;
  captainId: string;
  playerIds: string[];
  score: number;
};

export type PlayerMatchStat = {
  playerId: string;
  passingTd: number;
  interceptionsThrown: number;
  receivingTd: number;
  rushingTd: number;
  catches: number;
  interceptionsCaught: number;
  passBreakups: number;
  xp: number;
};

export type Match = {
  id: string;
  seasonId: string;
  date: string;
  venue: string;
  status: "Final" | "Live" | "Scheduled";
  teams: [MatchTeam, MatchTeam];
  mvpId: string;
  topOffenseId: string;
  topDefenseId: string;
  playOfTheGame: string;
  timeline: string[];
  comments: number;
  reactions: number;
  recap: string;
  recapOverride?: string;
  statLines: PlayerMatchStat[];
};

export type Award = {
  id: string;
  title: string;
  winnerId: string;
  weekLabel: string;
  category: "Weekly MVP" | "Offensive" | "Defensive" | "Honor";
  summary: string;
};

export type Badge = {
  id: string;
  name: string;
  rarity: "Core" | "Rare" | "Epic" | "Legendary";
  description: string;
};

export type LeaderboardRow = {
  label: string;
  playerId: string;
  value: string;
  change: string;
};

export type WeeklySummary = {
  id: string;
  seasonId: string;
  title: string;
  spotlightId: string;
  gameOfWeek: string;
  riseId: string;
  headline: string;
};
