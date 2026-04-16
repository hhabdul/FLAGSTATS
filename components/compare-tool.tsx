"use client";

import { useMemo, useState } from "react";

import { ComparisonTable } from "@/components/league-widgets";
import { InlineMessage, Panel, Select } from "@/components/ui";
import { matches, players } from "@/lib/mock-data";

export function CompareTool() {
  const [leftId, setLeftId] = useState(players[0]?.id ?? "");
  const [rightId, setRightId] = useState(players[2]?.id ?? players[1]?.id ?? "");

  const left = useMemo(() => players.find((player) => player.id === leftId) ?? players[0], [leftId]);
  const right = useMemo(() => players.find((player) => player.id === rightId) ?? players[1] ?? players[0], [rightId]);

  const duplicate = left.id === right.id;

  return (
    <div className="space-y-5">
      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm font-semibold">Player A</div>
            <Select value={leftId} onChange={(event) => setLeftId(event.target.value)}>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.displayName}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-semibold">Player B</div>
            <Select value={rightId} onChange={(event) => setRightId(event.target.value)}>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.displayName}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </Panel>

      {duplicate ? (
        <InlineMessage
          title="Choose two different players"
          body="Comparison works best when each side is unique. Your current selections are preserved until you change one of them."
          tone="warning"
        />
      ) : (
        <ComparisonTable left={left} right={right} matches={matches} />
      )}
    </div>
  );
}
