"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Field, InlineMessage, Input, Panel, Pill, Select, TextArea } from "@/components/ui";
import { Player, Season, TeamProfile } from "@/lib/types";

// ─── Stat definitions ────────────────────────────────────────────────────────

const quickStats = [
  { key: "passingTd", label: "Pass TD", positive: true },
  { key: "interceptionThrown", label: "INT Thrown", positive: false },
  { key: "receivingTd", label: "Receiving TD", positive: true },
  { key: "rushingTd", label: "Rushing TD", positive: true },
  { key: "catches", label: "Catch", positive: true },
  { key: "interceptionsCaught", label: "INT Caught", positive: true },
  { key: "passBreakups", label: "Pass Breakup", positive: true }
] as const;

type QuickStatKey = (typeof quickStats)[number]["key"];
type BoxScore = Record<string, Partial<Record<QuickStatKey, number>>>;
type TeamSide = "A" | "B";

const steps = ["Setup", "Rosters", "Stats", "Publish"];

// ─── Component ───────────────────────────────────────────────────────────────

export function LiveEntryBoard({ players, seasons, teams }: { players: Player[]; seasons: Season[]; teams: TeamProfile[] }) {
  const router = useRouter();

  // Setup
  const [step, setStep] = useState(0);
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "");
  const [venue, setVenue] = useState("Flag Football Sunday");
  const [teamAName, setTeamAName] = useState(teams[0]?.name ?? "Team A");
  const [teamBName, setTeamBName] = useState(teams[1]?.name ?? "Team B");

  // Rosters: maps playerId → 'A' | 'B' (unset = not playing)
  const [assignments, setAssignments] = useState<Record<string, TeamSide>>({});

  // Stats
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id ?? "");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [boxScore, setBoxScore] = useState<BoxScore>({});
  const [matchNote, setMatchNote] = useState("");

  // Publish
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  // ── Derived ──────────────────────────────────────────────────────────────

  const rosterA = players.filter((p) => assignments[p.id] === "A");
  const rosterB = players.filter((p) => assignments[p.id] === "B");
  const unassigned = players.filter((p) => !assignments[p.id]);

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? players[0];
  const selectedStats = selectedPlayer ? (boxScore[selectedPlayer.id] ?? {}) : {};

  const totalActions = useMemo(
    () => Object.values(boxScore).reduce((sum, s) => sum + Object.values(s).reduce((n, v) => n + (v ?? 0), 0), 0),
    [boxScore]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  function assign(playerId: string, side: TeamSide) {
    setAssignments((prev) => {
      if (prev[playerId] === side) {
        // Toggle off
        const next = { ...prev };
        delete next[playerId];
        return next;
      }
      return { ...prev, [playerId]: side };
    });
  }

  function bumpStat(playerId: string, key: QuickStatKey) {
    setBoxScore((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [key]: (prev[playerId]?.[key] ?? 0) + 1 }
    }));
  }

  function decrementStat(playerId: string, key: QuickStatKey) {
    setBoxScore((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [key]: Math.max(0, (prev[playerId]?.[key] ?? 0) - 1) }
    }));
  }

  function clearPlayer(playerId: string) {
    setBoxScore((prev) => ({ ...prev, [playerId]: {} }));
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  async function handlePublish() {
    setIsPublishing(true);
    setPublishError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPublishError("Not authenticated. Please log in again."); return; }

      // 1. Create match
      const { data: match, error: matchErr } = await supabase
        .from("matches")
        .insert({
          season_id: seasonId,
          scheduled_at: new Date().toISOString(),
          venue: venue || "Field TBD",
          status: "Final",
          play_of_the_game: matchNote || null,
          auto_recap: matchNote ? { summary: matchNote, timeline: [matchNote] } : {},
          created_by: user.id
        })
        .select("id")
        .single();

      if (matchErr || !match) { setPublishError(matchErr?.message ?? "Failed to create match."); return; }

      // 2. Create match teams
      const { data: matchTeams, error: teamsErr } = await supabase
        .from("match_teams")
        .insert([
          { match_id: match.id, side: "A", label: teamAName, score: scoreA },
          { match_id: match.id, side: "B", label: teamBName, score: scoreB }
        ])
        .select("id, side");

      if (teamsErr || !matchTeams) { setPublishError(teamsErr?.message ?? "Failed to create match teams."); return; }

      const teamIdBySide = Object.fromEntries(matchTeams.map((t) => [t.side, t.id])) as Record<TeamSide, string>;

      // 3. Insert match rosters
      const rosterRows = Object.entries(assignments).map(([profileId, side]) => ({
        match_team_id: teamIdBySide[side],
        profile_id: profileId
      }));

      if (rosterRows.length > 0) {
        const { error: rosterErr } = await supabase.from("match_rosters").insert(rosterRows);
        if (rosterErr) { setPublishError(`Rosters failed: ${rosterErr.message}`); return; }
      }

      // 4. Insert player stats
      const statRows = Object.entries(boxScore)
        .filter(([, s]) => Object.values(s).some((v) => (v ?? 0) > 0))
        .map(([profileId, s]) => {
          const side = assignments[profileId];
          const recTd = s.receivingTd ?? 0;
          const rushTd = s.rushingTd ?? 0;
          const passTd = s.passingTd ?? 0;
          const intThrown = s.interceptionThrown ?? 0;
          const catches = s.catches ?? 0;
          const intCaught = s.interceptionsCaught ?? 0;
          const pbu = s.passBreakups ?? 0;
          return {
            match_id: match.id,
            profile_id: profileId,
            match_team_id: side ? teamIdBySide[side] : null,
            passing_td: passTd,
            interceptions_thrown: intThrown,
            receiving_td: recTd,
            rushing_td: rushTd,
            catches,
            interceptions_caught: intCaught,
            pass_breakups: pbu,
            xp_earned: passTd * 15 + recTd * 40 + rushTd * 35 + catches * 10 + intCaught * 25 + pbu * 8
          };
        });

      if (statRows.length > 0) {
        const { error: statsErr } = await supabase.from("player_match_stats").insert(statRows);
        if (statsErr) { setPublishError(`Stats failed: ${statsErr.message}`); return; }
      }

      router.push(`/matches/${match.id}`);
      router.refresh();
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsPublishing(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      {/* Left panel – steps */}
      <Panel className="space-y-5">
        {/* Step tabs */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">Entry flow</div>
            <h2 className="mt-2 font-display text-3xl tracking-[-0.03em]">Create and publish one match</h2>
          </div>
          <Pill tone="hot">{steps[step]}</Pill>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-[20px] px-4 py-3 text-left transition ${i === step ? "bg-accent-cyan/12 text-ink-primary ring-1 ring-accent-cyan/20" : "bg-black/[0.04] dark:bg-white/[0.06]"}`}
            >
              <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Step {i + 1}</div>
              <div className="mt-1 font-semibold">{label}</div>
            </button>
          ))}
        </div>

        {/* ── Step 1: Setup ─────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Season" htmlFor="season" required hint="Controls standings and stat rollups.">
              <Select id="season" value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
                {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Venue" htmlFor="venue" hint="Optional.">
              <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Field TBD" />
            </Field>
            <Field label="Team A name" htmlFor="team-a" required>
              <Input id="team-a" value={teamAName} onChange={(e) => setTeamAName(e.target.value)} />
            </Field>
            <Field label="Team B name" htmlFor="team-b" required>
              <Input id="team-b" value={teamBName} onChange={(e) => setTeamBName(e.target.value)} />
            </Field>
          </div>
        )}

        {/* ── Step 2: Rosters ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["A", "B"] as const).map((side) => {
                const roster = side === "A" ? rosterA : rosterB;
                const name = side === "A" ? teamAName : teamBName;
                return (
                  <div key={side} className="rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 p-4 dark:bg-surface-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Team {side}</div>
                    <div className="mt-1 font-display text-2xl tracking-[-0.02em]">{name}</div>
                    <div className="mt-3 text-sm text-ink-muted">{roster.length} player{roster.length !== 1 ? "s" : ""} assigned</div>
                    <div className="mt-2 space-y-1">
                      {roster.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-[14px] bg-black/[0.04] px-3 py-2 text-sm dark:bg-white/[0.05]">
                          <span>{p.displayName}</span>
                          <button type="button" onClick={() => assign(p.id, side)} className="text-xs text-ink-muted hover:text-red-400">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                Assign players — {unassigned.length} unassigned
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {players.map((p) => {
                  const side = assignments[p.id];
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between rounded-[18px] border px-4 py-3 text-sm transition ${
                        side ? "border-accent-cyan/30 bg-accent-cyan/8" : "border-[color:var(--border-soft)] bg-surface-2 dark:bg-surface-3"
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{p.displayName}</div>
                        <div className="text-xs uppercase tracking-[0.12em] text-ink-muted">{p.position}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => assign(p.id, "A")}
                          className={`min-h-9 min-w-9 rounded-full text-xs font-bold transition ${side === "A" ? "bg-accent-cyan text-white" : "bg-black/[0.06] text-ink-muted hover:bg-black/[0.1] dark:bg-white/[0.08]"}`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => assign(p.id, "B")}
                          className={`min-h-9 min-w-9 rounded-full text-xs font-bold transition ${side === "B" ? "bg-accent-cyan text-white" : "bg-black/[0.06] text-ink-muted hover:bg-black/[0.1] dark:bg-white/[0.08]"}`}
                        >
                          B
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Stats ─────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            {/* Scores */}
            <div className="grid gap-4 sm:grid-cols-2">
              {([{ name: teamAName, score: scoreA, setScore: setScoreA }, { name: teamBName, score: scoreB, setScore: setScoreB }] as const).map(({ name, score, setScore }, i) => (
                <div key={i} className="rounded-[24px] border border-[color:var(--border-soft)] bg-surface-2 p-4 dark:bg-surface-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">{i === 0 ? "Team A" : "Team B"}</div>
                  <div className="mt-1 font-display text-2xl tracking-[-0.02em]">{name}</div>
                  <div className="mt-3 flex items-center gap-3">
                    <button type="button" onClick={() => setScore(Math.max(0, score - 1))} aria-label="Decrease score" className="min-h-11 min-w-11 rounded-full bg-black/[0.05] dark:bg-white/[0.08]">−</button>
                    <div className="font-display text-5xl">{score}</div>
                    <button type="button" onClick={() => setScore(score + 1)} aria-label="Increase score" className="min-h-11 min-w-11 rounded-full bg-accent-cyan/15 text-accent-cyan">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Player picker */}
            <div className="rounded-[24px] bg-black/[0.04] p-4 dark:bg-white/[0.06]">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Select player to log stats</div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`min-h-14 rounded-[18px] px-3 py-3 text-left transition ${selectedPlayerId === p.id ? "bg-accent-cyan/12 ring-1 ring-accent-cyan/20" : "bg-surface-2 dark:bg-surface-3"}`}
                  >
                    <div className="font-semibold text-sm">{p.displayName}</div>
                    <div className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-muted">
                      {assignments[p.id] ? `Team ${assignments[p.id]}` : "Unassigned"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Step 4: Publish ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            {publishError ? (
              <InlineMessage title="Publish failed" body={publishError} tone="warning" />
            ) : (
              <InlineMessage title="Ready to publish" body="Review the score below, add a game note, then hit Publish." tone="success" />
            )}
            <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 p-4 dark:bg-surface-3">
              <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">Final score</div>
              <div className="mt-2 font-display text-3xl tracking-[-0.02em]">{teamAName} {scoreA} — {scoreB} {teamBName}</div>
              <div className="mt-2 text-sm text-ink-muted">
                {rosterA.length + rosterB.length} players on rosters · {totalActions} stat actions logged
              </div>
            </div>
            <Field label="Play of the game" htmlFor="match-note" hint="Becomes the match recap seed.">
              <TextArea id="match-note" value={matchNote} onChange={(e) => setMatchNote(e.target.value)} placeholder="e.g. Ali Mansour toe-tap catch on 4th down to seal the win." />
            </Field>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="min-h-11 rounded-full bg-black/[0.05] px-4 py-2.5 text-sm font-semibold dark:bg-white/[0.08]">Back</button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="min-h-11 rounded-full bg-accent-cyan px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-blue">
              Continue
            </button>
          ) : (
            <button type="button" onClick={handlePublish} disabled={isPublishing} className="min-h-11 rounded-full bg-accent-cyan px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-blue disabled:opacity-60">
              {isPublishing ? "Publishing…" : "Publish match"}
            </button>
          )}
        </div>
      </Panel>

      {/* Right panel – stat entry */}
      <Panel className="space-y-5">
        {selectedPlayer ? (
          <>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">Logging stats for</div>
              <h3 className="mt-2 font-display text-2xl tracking-[-0.03em]">{selectedPlayer.displayName}</h3>
              <div className="mt-1 text-sm text-ink-muted">
                {assignments[selectedPlayer.id] ? `Team ${assignments[selectedPlayer.id]} · ` : "Unassigned · "}{selectedPlayer.position}
              </div>
            </div>

            <div className="grid gap-2">
              {quickStats.map((stat) => {
                const val = selectedStats[stat.key] ?? 0;
                return (
                  <div
                    key={stat.key}
                    className={`flex items-center justify-between rounded-[20px] border px-4 py-3 transition ${
                      stat.positive
                        ? "border-[color:var(--border-soft)] bg-surface-2 dark:bg-surface-3"
                        : "border-amber-200/50 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">{stat.label}</div>
                      {!stat.positive && <div className="text-xs text-ink-muted">Negative stat</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decrementStat(selectedPlayer.id, stat.key)}
                        className="min-h-9 min-w-9 rounded-full bg-black/[0.06] text-sm dark:bg-white/[0.08]"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-display text-xl">{val}</span>
                      <button
                        type="button"
                        onClick={() => bumpStat(selectedPlayer.id, stat.key)}
                        className="min-h-9 min-w-9 rounded-full bg-accent-cyan/15 text-accent-cyan text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={() => clearPlayer(selectedPlayer.id)} className="min-h-11 w-full rounded-full bg-black/[0.05] px-4 py-2.5 text-sm font-semibold dark:bg-white/[0.08]">
              Clear {selectedPlayer.displayName.split(" ")[0]}'s stats
            </button>

            <div className="rounded-[20px] bg-black/[0.04] p-4 text-sm text-ink-muted dark:bg-white/[0.06]">
              <div className="font-semibold text-ink-primary">{teamAName} {scoreA} – {scoreB} {teamBName}</div>
              <div className="mt-1">{totalActions} total actions · Step {step + 1} of {steps.length}</div>
            </div>
          </>
        ) : (
          <div className="text-sm text-ink-muted">No players loaded.</div>
        )}
      </Panel>
    </div>
  );
}
