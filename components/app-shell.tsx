"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Role } from "@/lib/types";

const primaryNav = [
  { href: "/dashboard", label: "Home", short: "Home" },
  { href: "/leaderboards", label: "Leaderboard", short: "Ranks" },
  { href: "/players", label: "Players", short: "Players" },
  { href: "/matches", label: "Matches", short: "Games" },
  { href: "/more", label: "More", short: "More" }
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, currentUser }: { children: ReactNode; currentUser: { displayName: string; username: string; role: Role } | null }) {
  const pathname = usePathname();
  const canEnterGames = currentUser?.role === "Admin" || currentUser?.role === "Coach";

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-[260px] shrink-0 border-r border-[color:var(--border-soft)] bg-surface-0/70 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
          <Link href="/dashboard" className="font-display text-xl tracking-[-0.03em]">
            FlagStats
          </Link>
          <div className="mt-8 space-y-2">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded-[16px] px-4 text-sm font-semibold transition ${
                    active ? "bg-black/[0.06] text-ink-primary dark:bg-white/[0.08]" : "text-ink-muted hover:bg-black/[0.04] hover:text-ink-primary dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {canEnterGames ? (
            <Link
              href="/live"
              className="mt-6 flex min-h-12 items-center justify-center rounded-[16px] bg-accent-cyan px-4 text-sm font-semibold text-white"
            >
              Enter Game
            </Link>
          ) : null}

          {canEnterGames ? (
            <Link
              href="/seasons"
              aria-current={isActive(pathname, "/seasons") ? "page" : undefined}
              className={`mt-2 flex min-h-12 items-center rounded-[16px] px-4 text-sm font-semibold transition ${
                isActive(pathname, "/seasons") ? "bg-black/[0.06] text-ink-primary dark:bg-white/[0.08]" : "text-ink-muted hover:bg-black/[0.04] hover:text-ink-primary dark:hover:bg-white/[0.05]"
              }`}
            >
              Seasons
            </Link>
          ) : null}

          {currentUser?.role === "Admin" ? (
            <Link
              href="/admin"
              aria-current={isActive(pathname, "/admin") ? "page" : undefined}
              className={`mt-2 flex min-h-12 items-center rounded-[16px] px-4 text-sm font-semibold transition ${
                isActive(pathname, "/admin") ? "bg-black/[0.06] text-ink-primary dark:bg-white/[0.08]" : "text-ink-muted hover:bg-black/[0.04] hover:text-ink-primary dark:hover:bg-white/[0.05]"
              }`}
            >
              Admin
            </Link>
          ) : null}

          <div className="mt-auto space-y-3">
            {currentUser ? (
              <div className="rounded-[16px] bg-black/[0.04] px-4 py-3 text-sm dark:bg-white/[0.06]">
                <div className="font-semibold">{currentUser.displayName}</div>
                <div className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                  {currentUser.role} • @{currentUser.username}
                </div>
              </div>
            ) : null}
            <LogoutButton />
            <ThemeToggle />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile header — minimal, no page-shell padding */}
          <header
            className="sticky top-0 z-40 border-b border-[color:var(--border-soft)] bg-surface-0/80 backdrop-blur-xl lg:hidden"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="font-display text-lg tracking-[-0.03em]">
                FlagStats
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>

      {/* Mobile FAB */}
      {canEnterGames ? (
        <Link
          href="/live"
          aria-label="Enter Game"
          className="fixed bottom-24 right-4 z-50 flex min-h-14 min-w-14 items-center justify-center rounded-full bg-accent-cyan px-5 text-sm font-semibold text-white shadow-glow md:bottom-6 md:right-6 lg:hidden"
        >
          <span className="hidden sm:inline">Enter Game</span>
          <span className="sm:hidden">+</span>
        </Link>
      ) : null}

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[color:var(--border-soft)] bg-surface-3/95 px-2 pt-2 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`py-2 text-center text-[10px] font-semibold uppercase tracking-[0.06em] ${
                  active ? "text-ink-primary" : "text-ink-muted"
                }`}
              >
                <span className={`mx-auto mb-1 block h-1 w-4 rounded-full transition-colors ${active ? "bg-accent-cyan" : "bg-transparent"}`} />
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
