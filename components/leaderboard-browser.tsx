"use client";

import { useState } from "react";

import { Panel, Pill, Select } from "@/components/ui";
import { getPlayerById } from "@/lib/league";
import { LeaderboardRow, Player } from "@/lib/types";

export function LeaderboardBrowser({
  leaderboardSets,
  players
}: {
  leaderboardSets: Record<string, LeaderboardRow[]>;
  players: Player[];
}) {
  const categories = Object.keys(leaderboardSets);
  const [category, setCategory] = useState(categories[0] ?? "Overall Power");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56">
          <Select aria-label="Leaderboard category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
        <Pill tone="hot">Current season</Pill>
      </div>

      <Panel>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Leaderboard</div>
            <h2 className="mt-2 font-display text-3xl tracking-[-0.03em]">{category}</h2>
          </div>
          <Pill tone="gold">Live ranks</Pill>
        </div>

        <div className="mt-5 space-y-3">
          {leaderboardSets[category]?.map((row) => {
            const player = getPlayerById(row.playerId, players);
            return (
              <div
                key={`${category}-${row.playerId}`}
                className="flex items-center justify-between rounded-[22px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:bg-surface-3 dark:shadow-none"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.05] font-display text-sm dark:bg-white/[0.08]">{row.label}</div>
                  <div>
                    <div className="font-semibold">{player?.displayName}</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">{player?.tier}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl tracking-[-0.03em]">{row.value}</div>
                  <div className="text-xs font-semibold text-accent-cyan">{row.change}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
