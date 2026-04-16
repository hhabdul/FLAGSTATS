import Link from "next/link";

import { DividerLabel, InlineMessage, Panel } from "@/components/ui";

export function AuthCard({
  title,
  subtitle,
  alternateHref,
  alternateLabel,
  children
}: {
  title: string;
  subtitle: string;
  alternateHref: string;
  alternateLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Panel className="w-full max-w-md p-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">Secure Access</div>
      <h1 className="mt-3 font-display text-4xl tracking-[-0.03em]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{subtitle}</p>

      <InlineMessage
        title="League access"
        body="Members can browse. Coaches can enter games. Admin controls coach access."
      />
      {children}

      <div className="mt-5">
        <DividerLabel>or</DividerLabel>
      </div>

      <div className="mt-4 text-sm text-ink-muted">
        <Link href={alternateHref} className="font-semibold text-accent-cyan">
          {alternateLabel}
        </Link>
      </div>
    </Panel>
  );
}
