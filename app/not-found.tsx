import Link from "next/link";

import { ActionButton, Panel } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <Panel className="max-w-xl text-center">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">Not found</div>
        <h1 className="mt-3 font-display text-4xl tracking-[-0.03em]">That page is not in the league records</h1>
        <p className="mt-4 text-sm leading-6 text-ink-muted">
          The link may be outdated, the record may have been removed, or the route does not exist yet.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ActionButton href="/dashboard">Go to dashboard</ActionButton>
          <ActionButton href="/matches" tone="secondary">
            Browse matches
          </ActionButton>
        </div>
        <div className="mt-4 text-sm text-ink-muted">
          <Link href="/players" className="font-semibold text-accent-cyan">
            Or open the player directory
          </Link>
        </div>
      </Panel>
    </main>
  );
}
