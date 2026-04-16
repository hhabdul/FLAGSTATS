"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteUser } from "@/lib/admin-actions";
import { Role } from "@/lib/types";
import { Select } from "@/components/ui";

type Profile = {
  id: string;
  display_name: string;
  slug: string;
  role: string;
};

function UserRow({ profile }: { profile: Profile }) {
  const [role, setRole] = useState<Role>(profile.role === "Admin" || profile.role === "Coach" ? profile.role : "Member");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteState, setDeleteState] = useState<"idle" | "confirm" | "deleting">("idle");

  async function handleRoleChange(newRole: Role) {
    const prev = role;
    setRole(newRole);
    setStatus("saving");
    setErrorMsg("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", profile.id);

      if (error) {
        setRole(prev);
        setErrorMsg(error.message);
        setStatus("error");
      } else {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch (err) {
      setRole(prev);
      setErrorMsg(err instanceof Error ? err.message : "Failed to update.");
      setStatus("error");
    }
  }

  async function handleDelete() {
    setDeleteState("deleting");
    setErrorMsg("");
    const result = await deleteUser(profile.id);
    if (result.error) {
      setErrorMsg(result.error);
      setDeleteState("idle");
    }
    // On success the parent page revalidates and this row disappears
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-4 dark:bg-surface-3">
      <div>
        <div className="font-semibold">{profile.display_name}</div>
        <div className="text-xs uppercase tracking-[0.14em] text-ink-muted">@{profile.slug}</div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {status === "saving" && <span className="text-xs text-ink-muted">Saving…</span>}
        {status === "saved" && <span className="text-xs text-emerald-500 dark:text-emerald-400">Saved</span>}
        {(status === "error" || errorMsg) && (
          <span className="max-w-[200px] truncate text-xs text-amber-600 dark:text-amber-400">{errorMsg}</span>
        )}
        <Select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value as Role)}
          className="w-32"
        >
          <option value="Member">Member</option>
          <option value="Coach">Coach</option>
          <option value="Admin">Admin</option>
        </Select>

        {deleteState === "idle" && (
          <button
            onClick={() => setDeleteState("confirm")}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        )}
        {deleteState === "confirm" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Delete account?</span>
            <button
              onClick={handleDelete}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setDeleteState("idle")}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              Cancel
            </button>
          </div>
        )}
        {deleteState === "deleting" && (
          <span className="text-xs text-ink-muted">Deleting…</span>
        )}
      </div>
    </div>
  );
}

export function AdminUserList({ profiles }: { profiles: Profile[] }) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 px-5 py-8 text-center text-sm text-ink-muted dark:bg-surface-3">
        No user profiles found. Run the bootstrap script to seed the league.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {profiles.map((profile) => (
        <UserRow key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
