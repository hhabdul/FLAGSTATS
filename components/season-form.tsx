"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ActionButton, Field, Input, InlineMessage, Panel, Select } from "@/components/ui";

export function SeasonForm() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"Upcoming" | "Active">("Upcoming");
  const [weekNumber, setWeekNumber] = useState(1);
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Season name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: insertError } = await supabase.from("seasons").insert({
        name: name.trim(),
        status,
        week_number: weekNumber,
        starts_on: startsOn || null,
        ends_on: endsOn || null
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccess(`"${name.trim()}" created.`);
      setName("");
      setStatus("Upcoming");
      setWeekNumber(1);
      setStartsOn("");
      setEndsOn("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Panel className="p-6">
      <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">New season</div>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        {error ? <InlineMessage title="Could not create season" body={error} tone="warning" /> : null}
        {success ? <InlineMessage title="Season created" body={success} tone="success" /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Season name" htmlFor="season-name" required hint='e.g. "Summer 2026 Flag Football"'>
            <Input
              id="season-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summer 2026 Flag Football"
            />
          </Field>

          <Field label="Status" htmlFor="season-status" required>
            <Select
              id="season-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "Upcoming" | "Active")}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
            </Select>
          </Field>

          <Field label="Starting week" htmlFor="week-number" hint="Which week number does this season open on?">
            <Input
              id="week-number"
              type="number"
              min={1}
              value={weekNumber}
              onChange={(e) => setWeekNumber(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="starts-on" hint="Optional">
            <Input id="starts-on" type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
          </Field>
          <Field label="End date" htmlFor="ends-on" hint="Optional">
            <Input id="ends-on" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
          </Field>
        </div>

        <ActionButton type="submit" tone="primary" disabled={isLoading}>
          {isLoading ? "Creating…" : "Create season"}
        </ActionButton>
      </form>
    </Panel>
  );
}
