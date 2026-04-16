"use client";

import { useState } from "react";

import { Pill, Select } from "@/components/ui";
import { seasons } from "@/lib/mock-data";

export function SeasonSelector({
  label = "Season view",
  includeAll = false
}: {
  label?: string;
  includeAll?: boolean;
}) {
  const [value, setValue] = useState(includeAll ? "all" : seasons[0]?.id ?? "");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Pill tone="muted">{label}</Pill>
      <div className="min-w-52">
        <Select aria-label={label} value={value} onChange={(event) => setValue(event.target.value)}>
          {includeAll ? <option value="all">All seasons</option> : null}
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
