import { Breadcrumbs } from "@/components/breadcrumbs";
import { LeaderboardBrowser } from "@/components/leaderboard-browser";
import { SectionHeader } from "@/components/ui";
import { getLeagueData } from "@/lib/league-data";

export default async function LeaderboardsPage() {
  const league = await getLeagueData();

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Leaderboard" }]} />
      <SectionHeader
        eyebrow="Leaderboard"
        title="Who's on top"
        copy="Rankings across every stat category. Switch categories, find your name, and see how close the competition really is."
      />
      <LeaderboardBrowser leaderboardSets={league.leaderboardSets} players={league.players} />
    </div>
  );
}
