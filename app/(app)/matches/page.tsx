import { Breadcrumbs } from "@/components/breadcrumbs";
import { MatchHistory } from "@/components/match-history";
import { SectionHeader } from "@/components/ui";
import { getLeagueData } from "@/lib/league-data";

export default async function MatchesPage() {
  const league = await getLeagueData();

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Matches" }]} />
      <SectionHeader
        eyebrow="Matches"
        title="Every game on record"
        copy="Full match history with scores, stats, and MVPs. Filter by season or team to settle any argument."
      />
      <MatchHistory matches={league.matches} seasons={league.seasons} teams={league.teams} players={league.players} />
    </div>
  );
}
