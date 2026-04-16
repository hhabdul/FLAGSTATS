"use client";

import { useMemo, useState } from "react";

import { MatchRecapCard } from "@/components/league-widgets";
import { InlineMessage, Input, Panel, Select } from "@/components/ui";
import { Match, Player, Season, TeamProfile } from "@/lib/types";

export function MatchHistory({
  matches,
  seasons,
  teams,
  players
}: {
  matches: Match[];
  seasons: Season[];
  teams: TeamProfile[];
  players: Player[];
}) {
  const [seasonId, setSeasonId] = useState("all");
  const [teamId, setTeamId] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return matches.filter((match) => {
      const seasonOk = seasonId === "all" || match.seasonId === seasonId;
      const teamOk = teamId === "all" || match.teams.some((team) => team.teamProfileId === teamId);
      const text = `${match.teams[0].label} ${match.teams[1].label} ${match.venue}`.toLowerCase();
      const queryOk = query.trim().length === 0 || text.includes(query.toLowerCase());
      return seasonOk && teamOk && queryOk;
    });
  }, [query, seasonId, teamId]);

  return (
    <div className="space-y-5">
      <Panel>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <label className="block">
            <div className="mb-2 text-sm font-semibold">Search matchups or venue</div>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Velocity, Aftershock, Riverview..." />
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-semibold">Season</div>
            <Select value={seasonId} onChange={(event) => setSeasonId(event.target.value)}>
              <option value="all">All seasons</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-semibold">Team</div>
            <Select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
              <option value="all">All teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <InlineMessage
          title="No matches fit those filters"
          body="Clear one filter to broaden the list. Search is applied instantly so you do not have to submit the form."
          tone="warning"
        />
      ) : null}

      <div className="space-y-5">
        {filtered.map((match) => (
          <MatchRecapCard key={match.id} match={match} players={players} />
        ))}
      </div>
    </div>
  );
}
