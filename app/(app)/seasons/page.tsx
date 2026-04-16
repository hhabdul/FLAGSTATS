import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pill, SectionHeader } from "@/components/ui";
import { SeasonForm } from "@/components/season-form";
import { DeleteSeasonButton } from "@/components/delete-season-button";

function statusTone(status: string): "lime" | "muted" | "gold" {
  if (status === "Active") return "lime";
  if (status === "Upcoming") return "gold";
  return "muted";
}

export default async function SeasonsPage() {
  const auth = await requireRole(["Admin", "Coach"]);
  const isAdmin = auth.profile?.role === "Admin";

  const supabase = await createSupabaseServerClient();
  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, name, status, week_number, starts_on, ends_on")
    .order("created_at", { ascending: false });

  return (
    <div className="page-shell space-y-6">
      <Breadcrumbs items={[{ label: "Seasons" }]} />
      <SectionHeader
        eyebrow="Seasons"
        title="Seasons"
        copy="Start a new season to open a fresh set of standings, matches, and awards. Deleting a season removes everything tied to it."
      />

      <SeasonForm />

      <div className="space-y-3">
        {(seasons ?? []).length === 0 ? (
          <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 px-5 py-8 text-center text-sm text-ink-muted dark:bg-surface-3">
            No seasons yet. Create one above.
          </div>
        ) : (
          (seasons ?? []).map((season) => (
            <div
              key={season.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[color:var(--border-soft)] bg-surface-2 px-5 py-4 dark:bg-surface-3"
            >
              <div>
                <div className="font-semibold">{season.name}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-muted">
                  Week {season.week_number}
                  {season.starts_on ? ` · ${season.starts_on}` : ""}
                  {season.ends_on ? ` – ${season.ends_on}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Pill tone={statusTone(season.status)}>{season.status}</Pill>
                {isAdmin ? <DeleteSeasonButton seasonId={season.id} /> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
