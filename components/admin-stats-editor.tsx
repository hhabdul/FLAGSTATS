"use client";

import { useState } from "react";

import { updateCareerStats, type CareerStatsPatch } from "@/lib/admin-actions";
import { Panel } from "@/components/ui";

const RANK_TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Elite", "Champion", "Legend"];

type Field = {
  key: keyof CareerStatsPatch;
  label: string;
};

const STAT_GROUPS: { heading: string; fields: Field[] }[] = [
  {
    heading: "Record",
    fields: [
      { key: "games_played", label: "Games" },
      { key: "wins", label: "Wins" },
      { key: "losses", label: "Losses" }
    ]
  },
  {
    heading: "Offense",
    fields: [
      { key: "passing_td", label: "Pass TD" },
      { key: "interceptions_thrown", label: "INT Thrown" },
      { key: "receiving_td", label: "Rec TD" },
      { key: "rushing_td", label: "Rush TD" },
      { key: "catches", label: "Catches" }
    ]
  },
  {
    heading: "Defense",
    fields: [
      { key: "interceptions_caught", label: "INT Caught" },
      { key: "pass_breakups", label: "Pass Breakups" }
    ]
  },
  {
    heading: "Awards",
    fields: [
      { key: "mvp_awards", label: "MVP Awards" },
      { key: "offensive_awards", label: "Off. Awards" },
      { key: "defensive_awards", label: "Def. Awards" }
    ]
  },
  {
    heading: "Progression",
    fields: [
      { key: "xp_total", label: "XP Total" },
      { key: "current_level", label: "Level" }
    ]
  }
];

export function AdminStatsEditor({ profileId, initial }: { profileId: string; initial: CareerStatsPatch }) {
  const [values, setValues] = useState<CareerStatsPatch>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(key: keyof CareerStatsPatch, raw: string) {
    if (key === "current_rank_tier") {
      setValues((prev) => ({ ...prev, current_rank_tier: raw || null }));
    } else {
      const n = parseInt(raw, 10);
      setValues((prev) => ({ ...prev, [key]: isNaN(n) ? 0 : Math.max(0, n) }));
    }
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    const result = await updateCareerStats(profileId, values);
    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Admin — edit career stats</div>
        <div className="flex items-center gap-3">
          {status === "saving" && <span className="text-xs text-ink-muted">Saving…</span>}
          {status === "saved" && <span className="text-xs text-emerald-500 dark:text-emerald-400">Saved</span>}
          {status === "error" && <span className="max-w-[240px] truncate text-xs text-amber-600 dark:text-amber-400">{errorMsg}</span>}
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="rounded-xl bg-accent-cyan px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {STAT_GROUPS.map((group) => (
          <div key={group.heading}>
            <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-ink-muted">{group.heading}</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {group.fields.map(({ key, label }) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-[11px] text-ink-muted">{label}</span>
                  <input
                    type="number"
                    min={0}
                    value={key === "current_rank_tier" ? 0 : (values[key] as number)}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-full rounded-xl border border-[color:var(--border-soft)] bg-surface-2 px-3 py-2 text-sm font-semibold text-ink-primary dark:bg-surface-3"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-ink-muted">Rank tier</div>
          <select
            value={values.current_rank_tier ?? ""}
            onChange={(e) => set("current_rank_tier", e.target.value)}
            className="rounded-xl border border-[color:var(--border-soft)] bg-surface-2 px-3 py-2 text-sm font-semibold text-ink-primary dark:bg-surface-3"
          >
            <option value="">— None —</option>
            {RANK_TIERS.map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
        </div>
      </div>
    </Panel>
  );
}
