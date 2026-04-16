import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ActionButton, MetricTile, Panel, Pill, ProgressBar } from "@/components/ui";
import { aggregatePlayer, getPlayerBySlug, getRecentForm } from "@/lib/league";
import { getLeagueData } from "@/lib/league-data";
import { getAuthContext } from "@/lib/auth";
import { AdminStatsEditor } from "@/components/admin-stats-editor";

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [league, auth] = await Promise.all([getLeagueData(), getAuthContext()]);
  const isAdmin = auth.profile?.role === "Admin";
  const player = getPlayerBySlug(slug, league.players);
  if (!player) notFound();

  const totals = aggregatePlayer(player.id, league.matches, league.players);
  const recentForm = getRecentForm(player.id, league.matches);
  const recentMatches = league.matches.filter((match) => match.statLines.some((line) => line.playerId === player.id)).slice(0, 4);

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Players", href: "/players" }, { label: player.displayName }]} />

      <Panel className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="hot">{player.tier}</Pill>
              <Pill tone="lime">{player.streak}</Pill>
            </div>
            <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] sm:text-5xl">{player.displayName}</h1>
            <div className="mt-2 text-sm uppercase tracking-[0.16em] text-ink-muted">
              {player.position} • {player.handle}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted">{player.bio}</p>
          </div>

          <div className="w-full max-w-sm rounded-[24px] bg-black/[0.04] p-4 dark:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Progress</div>
                <div className="mt-2 font-display text-3xl tracking-[-0.03em]">Level {player.level}</div>
              </div>
              <div className="font-semibold text-accent-cyan">{player.xp} XP</div>
            </div>
            <div className="mt-4">
              <ProgressBar value={player.xp % 1000} max={1000} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MetricTile label="Wins" value={`${totals.wins}`} />
          <MetricTile label="Losses" value={`${totals.losses}`} />
          <MetricTile label="Win rate" value={`${totals.winPct}%`} />
          <MetricTile label="Total TD" value={`${totals.totalTd}`} />
          <MetricTile label="MVP" value={`${player.mvpAwards}`} />
          <MetricTile label="Badges" value={`${player.badges.length}`} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ActionButton href="/matches">View Match History</ActionButton>
          <ActionButton href="/leaderboards" tone="secondary">
            Back to Leaderboard
          </ActionButton>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Recent form</div>
          <div className="mt-4 space-y-3">
            {recentForm.map((entry) => (
              <div key={entry.matchId} className="rounded-[18px] bg-black/[0.04] px-4 py-4 dark:bg-white/[0.06]">
                <div className="font-semibold">{entry.date}</div>
                <div className="mt-2 text-sm text-ink-muted">
                  {entry.impact?.receivingTd ?? 0} rec TD • {entry.impact?.passingTd ?? 0} pass TD • {entry.impact?.interceptionsCaught ?? 0} INT
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Badges</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {player.badges.map((badge) => (
                <Pill key={badge} tone="gold">
                  {badge}
                </Pill>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Recent matches</div>
          <div className="mt-4 space-y-3">
            {recentMatches.map((match) => {
              const line = match.statLines.find((entry) => entry.playerId === player.id);
              return (
                <ActionButton
                  key={match.id}
                  href={`/matches/${match.id}`}
                  tone="ghost"
                  className="flex w-full justify-between rounded-[18px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-4 text-left dark:bg-surface-3"
                >
                  <span>
                    <span className="block font-semibold">
                      {match.teams[0].label} {match.teams[0].score} - {match.teams[1].score} {match.teams[1].label}
                    </span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-ink-muted">{match.date}</span>
                  </span>
                  <span className="text-right text-sm text-ink-muted">
                    {line?.receivingTd ?? 0} rec TD
                    <br />
                    {line?.passingTd ?? 0} pass TD
                  </span>
                </ActionButton>
              );
            })}
          </div>
        </Panel>
      </div>

      {isAdmin ? (
        <AdminStatsEditor
          profileId={player.id}
          initial={{
            games_played: player.gamesPlayed ?? 0,
            wins: player.wins ?? 0,
            losses: player.losses ?? 0,
            passing_td: player.passingTd ?? 0,
            interceptions_thrown: player.interceptionsThrown ?? 0,
            receiving_td: player.receivingTd ?? 0,
            rushing_td: player.rushingTd ?? 0,
            catches: player.catches ?? 0,
            interceptions_caught: player.interceptionsCaught ?? 0,
            pass_breakups: player.passBreakups ?? 0,
            mvp_awards: player.mvpAwards ?? 0,
            offensive_awards: player.offensiveAwards ?? 0,
            defensive_awards: player.defensiveAwards ?? 0,
            xp_total: player.xp ?? 0,
            current_level: player.level ?? 1,
            current_rank_tier: player.tier ?? null
          }}
        />
      ) : null}
    </div>
  );
}
