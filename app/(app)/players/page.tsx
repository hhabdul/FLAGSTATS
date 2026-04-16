import { Breadcrumbs } from "@/components/breadcrumbs";
import { PlayersDirectory } from "@/components/players-directory";
import { SectionHeader } from "@/components/ui";
import { getLeagueData } from "@/lib/league-data";

export default async function PlayersPage() {
  const league = await getLeagueData();

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Players" }]} />
      <SectionHeader
        eyebrow="Players"
        title="The full roster"
        copy="Career stats follow the player, not the team. Search by name, filter by tier, and see exactly what everyone has put up this season."
      />
      <PlayersDirectory players={league.players} matches={league.matches} />
    </div>
  );
}
