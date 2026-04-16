"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MetricTile, Panel, Pill, Select, Input, InlineMessage } from "@/components/ui";
import { aggregatePlayer } from "@/lib/league";
import { Match, Player } from "@/lib/types";

export function PlayersDirectory({ players, matches }: { players: Player[]; matches: Match[] }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All tiers");

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesQuery =
        query.trim().length === 0 ||
        player.displayName.toLowerCase().includes(query.toLowerCase()) ||
        player.handle.toLowerCase().includes(query.toLowerCase()) ||
        player.position.toLowerCase().includes(query.toLowerCase());
      const matchesTier = tier === "All tiers" || player.tier === tier;
      return matchesQuery && matchesTier;
    });
  }, [query, tier]);

  return (
    <div className="space-y-5">
      <Panel>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="block">
            <div className="mb-2 text-sm font-semibold">Find a player</div>
            <Input
              aria-label="Find a player"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, tag, or position"
            />
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-semibold">Filter by rank tier</div>
            <Select aria-label="Filter by rank tier" value={tier} onChange={(event) => setTier(event.target.value)}>
              {["All tiers", "Champion", "Elite", "Diamond", "Platinum", "Gold", "Silver", "Bronze"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
          </label>
        </div>
      </Panel>

      {filteredPlayers.length === 0 ? (
        <InlineMessage
          title="No players match that filter"
          body="Try clearing the search or choosing a broader tier. Filters never remove your current view state."
          tone="warning"
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlayers.map((player) => {
          const stats = aggregatePlayer(player.id, matches, players);
          return (
            <Link href={`/players/${player.slug}`} key={player.id}>
              <Panel className="h-full transition hover:-translate-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-2xl tracking-[-0.03em]">{player.displayName}</div>
                    <div className="mt-1 text-sm text-ink-muted">
                      {player.position} • {player.handle}
                    </div>
                  </div>
                  <Pill tone="hot">{player.tier}</Pill>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink-muted">{player.bio}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetricTile label="Games" value={`${stats.games}`} />
                  <MetricTile label="Wins" value={`${stats.wins}`} />
                  <MetricTile label="TD" value={`${stats.totalTd}`} />
                  <MetricTile label="Awards" value={`${player.mvpAwards + player.offensiveAwards + player.defensiveAwards}`} />
                </div>
              </Panel>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
