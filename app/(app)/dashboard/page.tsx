import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ActionButton, InlineMessage, MetricTile, Panel, Pill, SectionHeader } from "@/components/ui";
import { formatDate, getCurrentSeason, getPlayerById } from "@/lib/league";
import { getLeagueData } from "@/lib/league-data";

export default async function DashboardPage() {
  const auth = await requireAuth();
  const league = await getLeagueData();
  const canEnterGames = auth.profile?.role === "Admin" || auth.profile?.role === "Coach";
  const currentSeason = getCurrentSeason(league.seasons);
  const featuredMatch =
    league.matches.find((match) => match.id === currentSeason?.featuredMatchId) ??
    league.matches.find((match) => match.seasonId === currentSeason?.id) ??
    league.matches[0];
  const mvp = featuredMatch ? getPlayerById(featuredMatch.mvpId, league.players) : undefined;
  const topOverall = league.leaderboardSets["Overall Power"]?.slice(0, 3) ?? [];
  const recentMatches = league.matches.slice(0, 3);

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Home" }]} />

      <SectionHeader
        eyebrow="Home"
        title="The league, right now"
        copy={canEnterGames ? "Active season, live standings, and a direct path to entering the next game. No digging required." : "Live standings, player stats, and every match on record. Your spot in the league is right here."}
        action={canEnterGames ? <ActionButton href="/live">Enter Game</ActionButton> : <ActionButton href="/leaderboards" tone="secondary">View standings</ActionButton>}
      />

      {league.source === "mock" ? (
        <InlineMessage
          title="Supabase is configured, but the hosted schema is not loaded yet"
          body="The app is currently showing local fallback data. Run supabase/schema.sql in Supabase, then run node scripts/bootstrap-real-league.mjs from this project to load the real league accounts and stats."
          tone="warning"
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Active season</div>
              <div className="mt-2 font-display text-4xl tracking-[-0.03em]">{currentSeason.name}</div>
              <div className="mt-2 text-sm text-ink-muted">Week {currentSeason.week} is active now.</div>
            </div>
            <Pill tone="lime">Live</Pill>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricTile label="Players active" value={`${currentSeason.summary.playersActive}`} />
            <MetricTile label="Matches played" value={`${currentSeason.summary.totalMatches}`} />
            <MetricTile label="Avg team score" value={`${currentSeason.summary.avgPoints}`} />
          </div>

          <div className="mt-6 rounded-[24px] border border-[color:var(--border-soft)] bg-surface-2 p-5 dark:bg-surface-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Next action</div>
                <div className="mt-2 font-display text-3xl tracking-[-0.03em]">{canEnterGames ? "Drop stats while they're fresh" : "See where you stand"}</div>
                <div className="mt-2 max-w-xl text-sm leading-6 text-ink-muted">
                  {canEnterGames
                    ? "Pick the season, set the rosters, enter scores and stats, name the MVP, publish. Done in under two minutes."
                    : "Browse the full roster, dig into career stats, and track every game on record. Coaches handle stat entry — ask an admin to upgrade your access."}
                </div>
              </div>
              <ActionButton href={canEnterGames ? "/live" : "/players"} tone="primary">
                {canEnterGames ? "Open entry flow" : "Open players"}
              </ActionButton>
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Current leader</div>
              <div className="mt-2 font-display text-3xl tracking-[-0.03em]">{mvp?.displayName ?? "No leader yet"}</div>
            </div>
            <Pill tone="gold">{mvp?.tier ?? "Open"}</Pill>
          </div>
          <div className="mt-5 space-y-3">
            {topOverall.map((row) => {
              const player = getPlayerById(row.playerId, league.players);
              return (
                <Link
                  key={row.playerId}
                  href={`/players/${player?.slug}`}
                  className="block rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:bg-surface-3 dark:shadow-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05] font-display text-sm dark:bg-white/[0.08]">{row.label}</div>
                      <div>
                        <div className="font-semibold">{player?.displayName}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">{player?.tier}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{row.value}</div>
                      <div className="text-xs text-accent-cyan">{row.change}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-5">
            <ActionButton href="/leaderboards" tone="secondary">
              View full leaderboard
            </ActionButton>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Featured match</div>
              {featuredMatch ? (
                <div className="mt-2 font-display text-3xl tracking-[-0.03em]">
                  {featuredMatch.teams[0].label} {featuredMatch.teams[0].score} - {featuredMatch.teams[1].score} {featuredMatch.teams[1].label}
                </div>
              ) : (
                <div className="mt-2 font-display text-3xl tracking-[-0.03em]">No match published yet</div>
              )}
            </div>
            <Pill tone="hot">{featuredMatch?.status ?? "Open"}</Pill>
          </div>
          {featuredMatch ? (
            <>
              <div className="mt-3 text-sm text-ink-muted">{formatDate(featuredMatch.date)} • {featuredMatch.venue}</div>
              <div className="mt-4 text-sm leading-6 text-ink-muted">{featuredMatch.recapOverride ?? featuredMatch.recap}</div>
            </>
          ) : (
            <div className="mt-4 text-sm leading-6 text-ink-muted">First game hasn't been entered yet. Once a coach publishes a match, it'll be featured here.</div>
          )}
          <div className="mt-5">
            <ActionButton href={featuredMatch ? `/matches/${featuredMatch.id}` : "/matches"} tone="secondary">
              Open match
            </ActionButton>
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Recent matches</div>
              <div className="mt-2 font-display text-3xl tracking-[-0.03em]">Latest results</div>
            </div>
            <ActionButton href="/matches" tone="ghost">
              View all
            </ActionButton>
          </div>
          <div className="mt-5 space-y-3">
            {recentMatches.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:bg-surface-3 dark:shadow-none"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {match.teams[0].label} {match.teams[0].score} - {match.teams[1].score} {match.teams[1].label}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-muted">{formatDate(match.date)}</div>
                  </div>
                  <Pill tone="muted">{getPlayerById(match.mvpId, league.players)?.displayName ?? "MVP pending"}</Pill>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
