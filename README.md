# FlagStats League

Mobile-first flag football web app built with Next.js App Router, Tailwind, and a Supabase-backed data model with safe mock fallback during setup.

## Security

- Browser hardening headers are configured in `next.config.mjs`
- Private-by-default indexing policy is configured in `app/layout.tsx`
- Supabase schema includes a security baseline in `supabase/schema.sql`
- Full security implementation notes and launch requirements are in `SECURITY.md`

## Stack recommendation

- Next.js: App shell, routing, server components, easy deployment on Vercel
- Supabase: Auth, Postgres, storage for avatars, row-level security
- Tailwind CSS: fast premium UI iteration with strong theming support

## Current app shape

- Home, Leaderboard, Players, Matches, and More
- Global `Enter Game` action
- Player profile and match detail pages
- Supabase server reads with mock fallback if the hosted schema is missing or empty

## Data model highlights

- `profiles` stores persistent player identity and roles
- `match_teams` and `match_rosters` preserve game-specific teams and player assignment
- `player_match_stats`, `player_season_stats`, and `player_career_stats` separate per-game, per-season, and all-time stats
- `rank_history`, `xp_history`, `awards`, `badges`, `weekly_summaries`, `comments`, and `reactions` support progression and social energy

## Match recap automation

On match finalize:

1. Lock final score and winning side
2. Aggregate player match stats
3. Pick MVP, top offense, top defense, and candidate play of the game
4. Update season stats and career stats
5. Apply XP rules, level progression, rank movement, and badge unlocks
6. Generate recap payload with manual admin override support

## Supabase setup

The app now reads from Supabase on the server, but your hosted project must have the schema applied first.

1. Open the Supabase SQL editor.
2. Run [supabase/schema.sql](/Users/uffsf/FlagStats/supabase/schema.sql).
3. From the project root, run `node scripts/bootstrap-real-league.mjs`.
4. Restart the app with `npm run dev`.

If the schema is missing or the tables are empty, the UI falls back to the local mock dataset so the app still loads.

## Next implementation steps

- Wire Supabase Auth and server-side role guards
- Move live match publishing from prototype state into real write endpoints
- Add avatar uploads through Supabase Storage
- Add recap generation and weekly summary jobs
