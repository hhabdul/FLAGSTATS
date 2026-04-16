"use client";

import { useState } from "react";

import { deleteSeason } from "@/lib/admin-actions";

export function DeleteSeasonButton({ seasonId }: { seasonId: string }) {
  const [state, setState] = useState<"idle" | "confirm" | "deleting">("idle");
  const [error, setError] = useState("");

  async function handleDelete() {
    setState("deleting");
    setError("");
    const result = await deleteSeason(seasonId);
    if (result.error) {
      setError(result.error);
      setState("idle");
    }
    // On success the page revalidates and this row disappears
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => setState("confirm")}
        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Delete
      </button>
    );
  }

  if (state === "confirm") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {error && <span className="text-xs text-amber-600 dark:text-amber-400">{error}</span>}
        <span className="text-xs text-ink-muted">Delete season and all data?</span>
        <button
          onClick={handleDelete}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700"
        >
          Yes, delete
        </button>
        <button
          onClick={() => setState("idle")}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return <span className="text-xs text-ink-muted">Deleting…</span>;
}
