import { Award, Badge, LeaderboardRow, Match, Player, Season, TeamProfile, WeeklySummary } from "@/lib/types";

export const players: Player[] = [
  {
    id: "p1",
    slug: "jett-cross",
    displayName: "Jett Cross",
    handle: "JETT7",
    avatar: "JC",
    position: "QB / Coach",
    role: "Coach",
    bio: "Tempo-setter with a quick-release arm and loud sideline energy.",
    level: 31,
    xp: 4820,
    tier: "Champion",
    streak: "W4",
    mvpAwards: 3,
    offensiveAwards: 5,
    defensiveAwards: 0,
    badges: ["Coach", "Weekly MVP", "Clutch Performer", "Dynasty"],
    reactions: 42,
    comments: 16
  },
  {
    id: "p2",
    slug: "nova-blaze",
    displayName: "Nova Blaze",
    handle: "NOVA",
    avatar: "NB",
    position: "WR",
    role: "Member",
    bio: "Vertical threat who turns jump balls into weekly highlight clips.",
    level: 27,
    xp: 4250,
    tier: "Elite",
    streak: "Hot",
    mvpAwards: 2,
    offensiveAwards: 4,
    defensiveAwards: 0,
    badges: ["First Touchdown", "Hot Streak", "Best Catch"],
    reactions: 55,
    comments: 21
  },
  {
    id: "p3",
    slug: "ace-hollow",
    displayName: "Ace Hollow",
    handle: "ACE",
    avatar: "AH",
    position: "DB / WR",
    role: "Coach",
    bio: "Two-way playmaker with shutdown coverage and fast-twitch cuts.",
    level: 29,
    xp: 4460,
    tier: "Elite",
    streak: "W2",
    mvpAwards: 1,
    offensiveAwards: 1,
    defensiveAwards: 4,
    badges: ["Lockdown Defender", "Interception King", "Coach"],
    reactions: 37,
    comments: 12
  },
  {
    id: "p4",
    slug: "miles-rift",
    displayName: "Miles Rift",
    handle: "RIFT",
    avatar: "MR",
    position: "WR / RB",
    role: "Member",
    bio: "Possession target who keeps drives alive and slips into space.",
    level: 23,
    xp: 3480,
    tier: "Diamond",
    streak: "L1",
    mvpAwards: 1,
    offensiveAwards: 2,
    defensiveAwards: 0,
    badges: ["Ironman", "Clutch Performer"],
    reactions: 24,
    comments: 8
  },
  {
    id: "p5",
    slug: "onyx-ward",
    displayName: "Onyx Ward",
    handle: "ONYX",
    avatar: "OW",
    position: "DB",
    role: "Admin",
    bio: "Back-end organizer, rules enforcer, and instinctive ball hawk.",
    level: 26,
    xp: 3990,
    tier: "Diamond",
    streak: "W1",
    mvpAwards: 0,
    offensiveAwards: 0,
    defensiveAwards: 3,
    badges: ["Admin", "Lockdown Defender", "Ironman"],
    reactions: 18,
    comments: 5
  },
  {
    id: "p6",
    slug: "kai-vector",
    displayName: "Kai Vector",
    handle: "KVX",
    avatar: "KV",
    position: "QB / Safety",
    role: "Member",
    bio: "Reads leverage fast and thrives in late-game scramble drills.",
    level: 21,
    xp: 3010,
    tier: "Platinum",
    streak: "Rising",
    mvpAwards: 0,
    offensiveAwards: 1,
    defensiveAwards: 1,
    badges: ["Most Improved"],
    reactions: 14,
    comments: 3
  }
];

export const teams: TeamProfile[] = [
  {
    id: "t1",
    slug: "velocity",
    name: "Velocity",
    captainId: "p1",
    branding: "Turbo-blue transition team built around pace and spacing.",
    accent: "#45E4FF",
    secondary: "#1C4DFF",
    record: "5-1",
    powerRank: 1,
    description: "Usually opens with quick-game concepts and defensive pressure packages."
  },
  {
    id: "t2",
    slug: "aftershock",
    name: "Aftershock",
    captainId: "p3",
    branding: "Aggressive press team with highlight-driven offense.",
    accent: "#FF56E6",
    secondary: "#FF9A3C",
    record: "4-2",
    powerRank: 2,
    description: "Leans on contested catches, disruptive DB play, and emotional momentum swings."
  },
  {
    id: "t3",
    slug: "ghostline",
    name: "Ghostline",
    captainId: "p5",
    branding: "Tactical mix-and-match unit with low-scoring wins.",
    accent: "#95FF9C",
    secondary: "#2EC5A5",
    record: "3-3",
    powerRank: 3,
    description: "Flexible captain-led group that values turnovers and field position."
  }
];

export const seasons: Season[] = [
  {
    id: "s2",
    name: "Spring 2026 Circuit",
    status: "Active",
    week: 6,
    featuredMatchId: "m3",
    summary: {
      totalMatches: 12,
      playersActive: 18,
      avgPoints: 34.2,
      bestOffense: "Velocity",
      bestDefense: "Aftershock"
    }
  },
  {
    id: "s1",
    name: "Fall 2025 Launch Season",
    status: "Completed",
    week: 8,
    featuredMatchId: "m1",
    summary: {
      totalMatches: 16,
      playersActive: 16,
      avgPoints: 31.7,
      bestOffense: "Aftershock",
      bestDefense: "Ghostline"
    }
  }
];

export const matches: Match[] = [
  {
    id: "m3",
    seasonId: "s2",
    date: "2026-04-12",
    venue: "Riverview Turf",
    status: "Final",
    teams: [
      {
        side: "A",
        teamProfileId: "t1",
        label: "Velocity",
        captainId: "p1",
        playerIds: ["p1", "p2", "p4"],
        score: 28
      },
      {
        side: "B",
        teamProfileId: "t2",
        label: "Aftershock",
        captainId: "p3",
        playerIds: ["p3", "p5", "p6"],
        score: 24
      }
    ],
    mvpId: "p1",
    topOffenseId: "p2",
    topDefenseId: "p3",
    playOfTheGame: "Nova Blaze one-hand corner fade on 4th down with 0:41 left.",
    timeline: [
      "Q1 8:15 Jett Cross hits Nova Blaze deep for the opener.",
      "Q2 3:03 Ace Hollow jumps the route for a goal-line interception.",
      "Q4 0:41 Nova Blaze lands the go-ahead corner fade."
    ],
    comments: 14,
    reactions: 39,
    recap:
      "Velocity escaped Aftershock 28-24 behind Jett Cross control, Nova Blaze highlight catches, and a late red-zone stand.",
    statLines: [
      { playerId: "p1", passingTd: 4, interceptionsThrown: 1, receivingTd: 0, rushingTd: 0, catches: 0, interceptionsCaught: 0, passBreakups: 0, xp: 460 },
      { playerId: "p2", passingTd: 0, interceptionsThrown: 0, receivingTd: 3, rushingTd: 0, catches: 7, interceptionsCaught: 0, passBreakups: 1, xp: 420 },
      { playerId: "p4", passingTd: 0, interceptionsThrown: 0, receivingTd: 1, rushingTd: 0, catches: 5, interceptionsCaught: 0, passBreakups: 0, xp: 250 },
      { playerId: "p3", passingTd: 2, interceptionsThrown: 0, receivingTd: 1, rushingTd: 0, catches: 4, interceptionsCaught: 1, passBreakups: 2, xp: 370 },
      { playerId: "p5", passingTd: 0, interceptionsThrown: 0, receivingTd: 0, rushingTd: 0, catches: 1, interceptionsCaught: 1, passBreakups: 3, xp: 300 },
      { playerId: "p6", passingTd: 1, interceptionsThrown: 0, receivingTd: 1, rushingTd: 0, catches: 3, interceptionsCaught: 0, passBreakups: 1, xp: 230 }
    ]
  },
  {
    id: "m2",
    seasonId: "s2",
    date: "2026-04-05",
    venue: "Riverview Turf",
    status: "Final",
    teams: [
      {
        side: "A",
        teamProfileId: "t3",
        label: "Ghostline",
        captainId: "p5",
        playerIds: ["p5", "p6", "p2"],
        score: 20
      },
      {
        side: "B",
        teamProfileId: "t1",
        label: "Velocity",
        captainId: "p1",
        playerIds: ["p1", "p3", "p4"],
        score: 26
      }
    ],
    mvpId: "p3",
    topOffenseId: "p1",
    topDefenseId: "p5",
    playOfTheGame: "Ace Hollow pick-six swung the second half.",
    timeline: [
      "Q1 4:20 Ghostline opened with a scripted trick play.",
      "Q3 6:11 Ace Hollow jumped an out route for six.",
      "Q4 1:08 Velocity converted 4th-and-long to seal it."
    ],
    comments: 9,
    reactions: 24,
    recap:
      "Velocity outlasted Ghostline 26-20 after Ace Hollow flipped momentum with a second-half interception return.",
    statLines: [
      { playerId: "p5", passingTd: 0, interceptionsThrown: 0, receivingTd: 0, rushingTd: 0, catches: 1, interceptionsCaught: 1, passBreakups: 3, xp: 280 },
      { playerId: "p6", passingTd: 2, interceptionsThrown: 1, receivingTd: 0, rushingTd: 1, catches: 2, interceptionsCaught: 0, passBreakups: 1, xp: 310 },
      { playerId: "p2", passingTd: 0, interceptionsThrown: 0, receivingTd: 1, rushingTd: 0, catches: 6, interceptionsCaught: 0, passBreakups: 0, xp: 240 },
      { playerId: "p1", passingTd: 3, interceptionsThrown: 0, receivingTd: 0, rushingTd: 1, catches: 0, interceptionsCaught: 0, passBreakups: 0, xp: 390 },
      { playerId: "p3", passingTd: 0, interceptionsThrown: 0, receivingTd: 1, rushingTd: 0, catches: 3, interceptionsCaught: 1, passBreakups: 2, xp: 400 },
      { playerId: "p4", passingTd: 0, interceptionsThrown: 0, receivingTd: 1, rushingTd: 0, catches: 5, interceptionsCaught: 0, passBreakups: 0, xp: 230 }
    ]
  },
  {
    id: "m1",
    seasonId: "s1",
    date: "2025-11-02",
    venue: "North Loop Field",
    status: "Final",
    teams: [
      {
        side: "A",
        teamProfileId: "t2",
        label: "Aftershock",
        captainId: "p3",
        playerIds: ["p3", "p2", "p6"],
        score: 32
      },
      {
        side: "B",
        teamProfileId: "t3",
        label: "Ghostline",
        captainId: "p5",
        playerIds: ["p5", "p1", "p4"],
        score: 27
      }
    ],
    mvpId: "p2",
    topOffenseId: "p2",
    topDefenseId: "p5",
    playOfTheGame: "Nova Blaze took a short cross 55 yards through traffic.",
    timeline: [
      "Q1 5:44 Nova Blaze broke the game open with a catch-and-run.",
      "Q3 1:13 Ghostline forced back-to-back incompletions at the goal line.",
      "Q4 0:27 Aftershock recovered the final lateral."
    ],
    comments: 11,
    reactions: 29,
    recap:
      "Aftershock won the launch-season title game 32-27 with Nova Blaze delivering the signature offensive performance.",
    statLines: [
      { playerId: "p3", passingTd: 2, interceptionsThrown: 0, receivingTd: 1, rushingTd: 0, catches: 4, interceptionsCaught: 0, passBreakups: 2, xp: 380 },
      { playerId: "p2", passingTd: 0, interceptionsThrown: 0, receivingTd: 3, rushingTd: 0, catches: 8, interceptionsCaught: 0, passBreakups: 0, xp: 440 },
      { playerId: "p6", passingTd: 0, interceptionsThrown: 0, receivingTd: 0, rushingTd: 1, catches: 2, interceptionsCaught: 0, passBreakups: 1, xp: 210 },
      { playerId: "p5", passingTd: 0, interceptionsThrown: 0, receivingTd: 0, rushingTd: 0, catches: 1, interceptionsCaught: 1, passBreakups: 4, xp: 320 },
      { playerId: "p1", passingTd: 3, interceptionsThrown: 1, receivingTd: 0, rushingTd: 0, catches: 0, interceptionsCaught: 0, passBreakups: 0, xp: 350 },
      { playerId: "p4", passingTd: 0, interceptionsThrown: 0, receivingTd: 2, rushingTd: 0, catches: 6, interceptionsCaught: 0, passBreakups: 0, xp: 260 }
    ]
  }
];

export const awards: Award[] = [
  {
    id: "a1",
    title: "Week 6 MVP",
    winnerId: "p1",
    weekLabel: "Spring 2026 Week 6",
    category: "Weekly MVP",
    summary: "Controlled the pace with four passing TDs and the match-winning drive."
  },
  {
    id: "a2",
    title: "Air Raid Award",
    winnerId: "p2",
    weekLabel: "Spring 2026 Week 6",
    category: "Offensive",
    summary: "Three receiving touchdowns and the catch of the week."
  },
  {
    id: "a3",
    title: "Lockdown Medal",
    winnerId: "p3",
    weekLabel: "Spring 2026 Week 6",
    category: "Defensive",
    summary: "Interception plus multiple pass breakups in the red zone."
  }
];

export const badges: Badge[] = [
  { id: "b1", name: "First Touchdown", rarity: "Core", description: "Score your first career touchdown." },
  { id: "b2", name: "Interception King", rarity: "Epic", description: "Lead the league in interceptions for a season." },
  { id: "b3", name: "Lockdown Defender", rarity: "Rare", description: "Stack three-plus pass breakups in a win." },
  { id: "b4", name: "Weekly MVP", rarity: "Epic", description: "Earn the top weekly performance award." },
  { id: "b5", name: "Hot Streak", rarity: "Rare", description: "Win three straight with a scoring contribution." },
  { id: "b6", name: "Dynasty", rarity: "Legendary", description: "Anchor the top-ranked team across a season." },
  { id: "b7", name: "Clutch Performer", rarity: "Epic", description: "Create the winning score or stop in the final minute." },
  { id: "b8", name: "Ironman", rarity: "Rare", description: "Play every game in a full season." }
];

export const leaderboardSets: Record<string, LeaderboardRow[]> = {
  "Overall Power": [
    { label: "1", playerId: "p1", value: "2,180 PR", change: "+2" },
    { label: "2", playerId: "p3", value: "2,050 PR", change: "+1" },
    { label: "3", playerId: "p2", value: "1,980 PR", change: "+3" },
    { label: "4", playerId: "p5", value: "1,760 PR", change: "-" }
  ],
  "Top Receivers": [
    { label: "1", playerId: "p2", value: "21 catches", change: "+1" },
    { label: "2", playerId: "p4", value: "16 catches", change: "-" },
    { label: "3", playerId: "p3", value: "11 catches", change: "+2" },
    { label: "4", playerId: "p6", value: "7 catches", change: "-" }
  ],
  "Top QBs": [
    { label: "1", playerId: "p1", value: "10 pass TD", change: "+1" },
    { label: "2", playerId: "p3", value: "4 pass TD", change: "-" },
    { label: "3", playerId: "p6", value: "3 pass TD", change: "+1" }
  ],
  "Top Defenders": [
    { label: "1", playerId: "p3", value: "4 INT/PBU impact", change: "+2" },
    { label: "2", playerId: "p5", value: "13 PBUs", change: "-" },
    { label: "3", playerId: "p1", value: "7 stops", change: "+1" }
  ]
};

export const weeklySummaries: WeeklySummary[] = [
  {
    id: "w1",
    seasonId: "s2",
    title: "Week 6 Pulse",
    spotlightId: "p1",
    gameOfWeek: "Velocity vs Aftershock",
    riseId: "p6",
    headline: "Velocity holds the top seed while Kai Vector keeps climbing the all-around ladder."
  }
];
