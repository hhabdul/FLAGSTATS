import Link from "next/link";
import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Pill({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "hot" | "lime" | "gold" | "muted";
}) {
  const toneMap = {
    default: "bg-black/[0.04] text-ink-primary dark:bg-white/[0.06]",
    hot: "bg-sky-100 text-sky-800 dark:bg-slate-700 dark:text-slate-100",
    lime: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    gold: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
    muted: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
  };

  return <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${toneMap[tone]}`}>{children}</span>;
}

export function SectionHeader({
  eyebrow,
  title,
  copy,
  action
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-muted">{eyebrow}</div>
        <h1 className="font-display text-3xl tracking-[-0.03em] sm:text-4xl">{title}</h1>
        {copy ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{copy}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass-panel card-outline rounded-[24px] p-5 shadow-glow ${className}`}>{children}</section>;
}

export function SurfaceCard({
  title,
  description,
  action,
  className = ""
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Panel className={className}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-[-0.02em]">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p> : null}
        </div>
        {action}
      </div>
    </Panel>
  );
}

export function StatCard({
  label,
  value,
  detail,
  accent = "from-slate-100 to-white dark:from-slate-800/80 dark:to-slate-800/40"
}: {
  label: string;
  value: string;
  detail: string;
  accent?: string;
}) {
  return (
    <Panel className={`overflow-hidden bg-gradient-to-br ${accent}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-muted">{label}</div>
      <div className="mt-4 font-display text-3xl tracking-[-0.03em]">{value}</div>
      <div className="mt-2 text-sm leading-6 text-ink-muted">{detail}</div>
    </Panel>
  );
}

export function ActionButton({
  children,
  href,
  tone = "primary",
  className = "",
  type = "button",
  ...props
}: {
  children: ReactNode;
  href?: string;
  tone?: "primary" | "secondary" | "ghost";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const shared =
    "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const toneMap = {
    primary: "bg-accent-cyan text-white hover:bg-accent-blue active:translate-y-px",
    secondary: "border border-[color:var(--border-soft)] bg-surface-2 text-ink-primary hover:bg-surface-3",
    ghost: "bg-transparent text-ink-primary hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
  };

  if (href) {
    return (
      <Link href={href} className={`${shared} ${toneMap[tone]} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={`${shared} ${toneMap[tone]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div aria-label={`${pct}% progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={pct} role="progressbar" className="h-2 overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/[0.08]">
      <div
        className="h-full rounded-full bg-accent-cyan transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function InlineMessage({
  title,
  body,
  tone = "info"
}: {
  title: string;
  body: string;
  tone?: "info" | "success" | "warning";
}) {
  const styles = {
    info: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60",
    success: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
  };

  return (
    <div className={`rounded-[20px] border px-4 py-3 ${styles[tone]}`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm leading-6 text-ink-muted">{body}</div>
    </div>
  );
}

export function MetricTile({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[18px] bg-black/[0.04] px-4 py-3 dark:bg-white/[0.04]">
      <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-xl tracking-[-0.02em]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-ink-muted">{hint}</div> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  required = false,
  children
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span>{label}</span>
        {required ? <span className="text-accent-cyan">*</span> : null}
      </div>
      {children}
      {hint ? <div className="mt-2 text-xs leading-5 text-ink-muted">{hint}</div> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-12 w-full rounded-[16px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-3 text-sm text-ink-primary outline-none transition placeholder:text-ink-muted focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/15 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`min-h-12 w-full rounded-[16px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-3 text-sm text-ink-primary outline-none transition focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/15 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full rounded-[16px] border border-[color:var(--border-soft)] bg-surface-2 px-4 py-3 text-sm text-ink-primary outline-none transition placeholder:text-ink-muted focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/15 ${props.className ?? ""}`}
    />
  );
}

export function DividerLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
      <span className="h-px flex-1 bg-[color:var(--border-soft)]" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-[color:var(--border-soft)]" />
    </div>
  );
}
