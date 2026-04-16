import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ActionButton, MetricTile, Panel, Pill } from "@/components/ui";
import { buildMatchSummary, formatDate, getMatchById, getPlayerById } from "@/lib/league";
import { getLeagueData } from "@/lib/league-data";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const league = await getLeagueData();
  const match = getMatchById(id, league.matches);
  if (!match) notFound();

  const summary = buildMatchSummary(match, league.players);

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Matches", href: "/matches" }, { label: `${match.teams[0].label} vs ${match.teams[1].label}` }]} />

      <Panel className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="hot">{match.status}</Pill>
              <Pill tone="muted">{formatDate(match.date)}</Pill>
            </div>
            <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] sm:text-5xl">
              {match.teams[0].label} {match.teams[0].score} - {match.teams[1].score} {match.teams[1].label}
            </h1>
            <div className="mt-2 text-sm text-ink-muted">{match.venue}</div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-muted">{match.recapOverride ?? match.recap}</p>
          </div>

          <div className="w-full max-w-sm rounded-[24px] bg-black/[0.04] p-4 dark:bg-white/[0.06]">
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Main result</div>
            <div className="mt-3 space-y-3">
              <MetricTile label="Winner" value={summary.winner} />
              <MetricTile label="MVP" value={summary.mvp} />
              <MetricTile label="Top offense" value={summary.offense} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ActionButton href="/matches">Back to Matches</ActionButton>
          <ActionButton href="/leaderboards" tone="secondary">
            Check Leaderboard
          </ActionButton>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel className="p-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Teams</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {match.teams.map((team) => (
                <div key={team.side} className="rounded-[18px] bg-black/[0.04] p-4 dark:bg-white/[0.06]">
                <div className="font-display text-2xl tracking-[-0.03em]">{team.label}</div>
                <div className="mt-3 space-y-2 text-sm">
                  {team.playerIds.map((playerId) => (
                    <div key={playerId}>{getPlayerById(playerId, league.players)?.displayName}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Key moments</div>
            <div className="mt-3 space-y-3">
              {match.timeline.map((item) => (
                <div key={item} className="rounded-[18px] bg-black/[0.04] px-4 py-4 text-sm dark:bg-white/[0.06]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Top stat lines</div>
          <div className="mt-4 space-y-3">
            {match.statLines.map((line) => (
              <div key={line.playerId} className="rounded-[18px] bg-black/[0.04] px-4 py-4 dark:bg-white/[0.06]">
                <div className="font-semibold">{getPlayerById(line.playerId, league.players)?.displayName}</div>
                <div className="mt-2 text-sm text-ink-muted">
                  {line.passingTd} pass TD • {line.receivingTd} rec TD • {line.rushingTd} rush TD • {line.catches} catches • {line.interceptionsCaught} INT • {line.passBreakups} PBU
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
