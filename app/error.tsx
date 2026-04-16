"use client";

import { useEffect } from "react";

import { ActionButton, InlineMessage, Panel } from "@/components/ui";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell flex min-h-screen items-center justify-center">
      <Panel className="max-w-2xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">Unexpected error</div>
        <h1 className="mt-3 font-display text-4xl uppercase">The platform hit a problem loading this screen</h1>
        <p className="mt-4 text-sm leading-6 text-ink-muted">
          Your data entry or browsing context may still be recoverable. Try reloading this view first. If the issue keeps happening, check the last action you took and retry from the previous page.
        </p>
        <div className="mt-5">
          <InlineMessage
            title="What you can do next"
            body="Use retry first. If the page still fails, return to the dashboard or the previous list screen so you do not lose context."
            tone="warning"
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ActionButton onClick={reset}>Retry page</ActionButton>
          <ActionButton href="/dashboard" tone="secondary">
            Go to dashboard
          </ActionButton>
        </div>
      </Panel>
    </main>
  );
}
