import Link from "next/link";

import { ActionButton, MetricTile, Panel, Pill, ProgressBar } from "@/components/ui";
import { aggregatePlayer, buildMatchSummary, formatDate, getPlayerById } from "@/lib/league";
import { LeaderboardRow, Match, Player } from "@/lib/types";

export function HeroMatchCard({ match }: { match: Match }) {
  const summary = buildMatchSummary(match);

  return (
    <Panel className="grid-ambient overflow-hidden bg-hero p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Pill tone="hot">Featured Match</Pill>
          <div className="mt-4 font-display text-3xl uppercase tracking-[0.08em] sm:text-5xl">
            {match.teams[0].label} <span className="text-ink-muted">vs</span> {match.teams[1].label}
          </div>
          <div className="mt-3 text-sm text-ink-muted">
            {formatDate(match.date)} • {match.venue}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted">
            {match.recapOverride ?? match.recap}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton href={`/matches/${match.id}`} tone="primary">
              Open full recap
            </ActionButton>
            <ActionButton href="/live" tone="secondary">
              Enter next game
            </ActionButton>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          {[match.teams[0], match.teams[1]].map((team) => (
            <div
              key={team.side}
              className="rounded-[24px] border border-[color:var(--border-soft)] bg-surface-2 px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:bg-surface-3 dark:shadow-none"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-ink-muted">{team.label}</div>
              <div className="mt-2 font-display text-4xl">{team.score}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricTile label="Winner" value={summary.winner} />
        <MetricTile label="MVP" value={summary.mvp} />
        <MetricTile label="Play of the game" value={summary.play} />
      </div>
    </Panel>
  );
}

export function SpotlightPlayerCard({ player, matches }: { player: Player; matches: Match[] }) {
  const stats = aggregatePlayer(player.id, matches);

  return (
    <Panel className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Pill tone="gold">Spotlight Player</Pill>
          <h3 className="mt-4 font-display text-3xl tracking-[-0.03em]">{player.displayName}</h3>
          <div className="mt-1 text-sm text-ink-muted">
            {player.position} • {player.handle}
          </div>
          <p className="mt-4 text-sm leading-6 text-ink-muted">{player.bio}</p>
        </div>
        <div className="stat-ring h-20 w-20">
          <span className="font-display text-xl">{player.level}</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <MetricTile label="Wins" value={`${stats.wins}`} />
        <MetricTile label="TD impact" value={`${stats.totalTd}`} />
        <MetricTile label="XP" value={`${player.xp}`} />
        <MetricTile label="Tier" value={player.tier} />
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-ink-muted">
          <span>Level progress</span>
          <span>{player.xp % 1000}/1000</span>
        </div>
        <ProgressBar value={player.xp % 1000} max={1000} />
      </div>
      <Link href={`/players/${player.slug}`} className="mt-5 inline-flex text-sm font-semibold text-accent-cyan">
        Open career profile
      </Link>
    </Panel>
  );
}

export function LeaderboardPanel({ title, rows, players }: { title: string; rows: LeaderboardRow[]; players: Player[] }) {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-muted">Leaderboard</div>
          <h3 className="mt-2 font-display text-2xl tracking-[-0.03em]">{title}</h3>
        </div>
        <Pill>{rows.length} ranked</Pill>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row) => {
          const player = getPlayerById(row.playerId, players);
          return (
            <div
              key={`${title}-${row.playerId}`}
              className="flex items-center justify-between rounded-[22px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-3 transition hover:bg-surface-3 dark:bg-surface-3 dark:hover:bg-white/[0.07]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05] font-display text-sm dark:bg-white/[0.08]">{row.label}</div>
                <div>
                  <div className="font-semibold">{player?.displayName}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">{player?.tier}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{row.value}</div>
                <div className="text-xs text-accent-cyan">{row.change}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function MatchRecapCard({ match, players }: { match: Match; players: Player[] }) {
  const mvp = getPlayerById(match.mvpId, players);

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{formatDate(match.date)}</div>
          <h3 className="mt-2 font-display text-2xl tracking-[-0.03em]">
            {match.teams[0].label} {match.teams[0].score} - {match.teams[1].score} {match.teams[1].label}
          </h3>
        </div>
        <Pill tone="hot">{match.status}</Pill>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-muted">{match.recapOverride ?? match.recap}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricTile label="MVP" value={mvp?.displayName ?? "Not assigned"} />
        <MetricTile label="Reactions" value={`${match.reactions}`} />
        <MetricTile label="Comments" value={`${match.comments}`} />
      </div>
      <Link href={`/matches/${match.id}`} className="mt-5 inline-flex text-sm font-semibold text-accent-cyan">
        View full recap
      </Link>
    </Panel>
  );
}

export function ComparisonTable({ left, right, matches }: { left: Player; right: Player; matches: Match[] }) {
  const leftStats = aggregatePlayer(left.id, matches);
  const rightStats = aggregatePlayer(right.id, matches);
  const rows = [
    ["Games", leftStats.games, rightStats.games],
    ["Total TD", leftStats.totalTd, rightStats.totalTd],
    ["Catches", leftStats.catches, rightStats.catches],
    ["INT caught", leftStats.interceptionsCaught, rightStats.interceptionsCaught],
    ["Win %", `${leftStats.winPct}%`, `${rightStats.winPct}%`],
    ["Awards", left.mvpAwards + left.offensiveAwards + left.defensiveAwards, right.mvpAwards + right.offensiveAwards + right.defensiveAwards]
  ];

  return (
    <Panel>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <ProfileMini player={left} />
        <div className="font-display text-lg text-ink-muted">VS</div>
        <ProfileMini player={right} />
      </div>
      <div className="mt-6 space-y-3">
        {rows.map(([label, leftValue, rightValue]) => (
          <div key={String(label)} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[20px] bg-black/[0.04] px-4 py-3 text-sm dark:bg-white/[0.06]">
            <div className="text-left font-semibold">{String(leftValue)}</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">{label}</div>
            <div className="text-right font-semibold">{String(rightValue)}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ProfileMini({ player }: { player: Player }) {
  return (
    <div>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/[0.05] font-display text-lg dark:bg-white/[0.08]">
        {player.avatar}
      </div>
      <div className="mt-2 font-semibold">{player.displayName}</div>
      <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">{player.tier}</div>
    </div>
  );
}
