import { LiveEntryBoard } from "@/components/live-entry-board";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getLeagueData } from "@/lib/league-data";

export default async function LivePage() {
  await requireRole(["Admin", "Coach"]);
  const league = await getLeagueData();

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Enter Game" }]} />
      <Panel className="p-6">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Enter Game</div>
          <h1 className="mt-3 font-display text-4xl tracking-[-0.03em] sm:text-5xl">Get it in before the group chat moves on</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Pick the season, sort the rosters, enter scores and individual stats, name the MVP, and publish. Two minutes or less.
          </p>
        </div>
      </Panel>
      <LiveEntryBoard players={league.players} seasons={league.seasons} teams={league.teams} />
    </div>
  );
}
