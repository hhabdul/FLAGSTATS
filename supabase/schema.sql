create extension if not exists pgcrypto;

create type app_role as enum ('Admin', 'Coach', 'Member');

create table public.profiles (
  id uuid primary key,
  display_name text not null,
  slug text unique not null,
  avatar_url text,
  position text,
  bio text,
  role app_role not null default 'Member',
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_on date,
  ends_on date,
  status text not null check (status in ('Active', 'Completed', 'Upcoming')),
  week_number integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.team_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  branding text,
  captain_profile_id uuid references public.profiles(id),
  accent_color text,
  secondary_color text,
  active boolean not null default true
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id),
  scheduled_at timestamptz not null,
  venue text,
  status text not null check (status in ('Scheduled', 'Live', 'Final')),
  winning_match_team_id uuid,
  mvp_profile_id uuid references public.profiles(id),
  top_offense_profile_id uuid references public.profiles(id),
  top_defense_profile_id uuid references public.profiles(id),
  play_of_the_game text,
  auto_recap jsonb not null default '{}'::jsonb,
  recap_override jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.match_teams (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_profile_id uuid references public.team_profiles(id),
  side text not null check (side in ('A', 'B')),
  label text not null,
  captain_profile_id uuid references public.profiles(id),
  score integer not null default 0
);

create table public.match_rosters (
  id uuid primary key default gen_random_uuid(),
  match_team_id uuid not null references public.match_teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id),
  role_label text,
  joined_at timestamptz not null default now(),
  unique (match_team_id, profile_id)
);

create table public.player_match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  profile_id uuid not null references public.profiles(id),
  match_team_id uuid references public.match_teams(id),
  passing_td integer not null default 0,
  interceptions_thrown integer not null default 0,
  receiving_td integer not null default 0,
  rushing_td integer not null default 0,
  catches integer not null default 0,
  interceptions_caught integer not null default 0,
  pass_breakups integer not null default 0,
  xp_earned integer not null default 0,
  unique (match_id, profile_id)
);

create table public.player_season_stats (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  profile_id uuid not null references public.profiles(id),
  games_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  passing_td integer not null default 0,
  interceptions_thrown integer not null default 0,
  receiving_td integer not null default 0,
  rushing_td integer not null default 0,
  catches integer not null default 0,
  interceptions_caught integer not null default 0,
  pass_breakups integer not null default 0,
  mvp_awards integer not null default 0,
  offensive_awards integer not null default 0,
  defensive_awards integer not null default 0,
  xp_total integer not null default 0,
  rank_tier text,
  level integer not null default 1,
  unique (season_id, profile_id)
);

create table public.player_career_stats (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  games_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  passing_td integer not null default 0,
  interceptions_thrown integer not null default 0,
  receiving_td integer not null default 0,
  rushing_td integer not null default 0,
  catches integer not null default 0,
  interceptions_caught integer not null default 0,
  pass_breakups integer not null default 0,
  mvp_awards integer not null default 0,
  offensive_awards integer not null default 0,
  defensive_awards integer not null default 0,
  xp_total integer not null default 0,
  current_rank_tier text,
  current_level integer not null default 1
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  rarity text not null,
  description text not null,
  xp_bonus integer not null default 0
);

create table public.player_badges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  season_id uuid references public.seasons(id),
  unlocked_at timestamptz not null default now(),
  unique (profile_id, badge_id, season_id)
);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id),
  week_number integer,
  category text not null,
  title text not null,
  profile_id uuid references public.profiles(id),
  summary text
);

create table public.rank_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season_id uuid references public.seasons(id),
  rank_tier text not null,
  rating integer not null,
  effective_at timestamptz not null default now()
);

create table public.xp_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season_id uuid references public.seasons(id),
  match_id uuid references public.matches(id) on delete set null,
  source text not null,
  amount integer not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid not null references public.profiles(id),
  match_id uuid references public.matches(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  target_profile_id uuid references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now()
);

create table public.team_records (
  id uuid primary key default gen_random_uuid(),
  team_profile_id uuid not null references public.team_profiles(id) on delete cascade,
  season_id uuid references public.seasons(id),
  wins integer not null default 0,
  losses integer not null default 0,
  points_for integer not null default 0,
  points_against integer not null default 0,
  power_rank integer
);

create table public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  week_number integer not null,
  summary jsonb not null default '{}'::jsonb,
  featured_match_id uuid references public.matches(id),
  spotlight_profile_id uuid references public.profiles(id),
  unique (season_id, week_number)
);

alter table public.seasons
  add constraint seasons_week_number_positive check (week_number > 0);

alter table public.match_teams
  add constraint match_teams_score_nonnegative check (score >= 0);

alter table public.player_match_stats
  add constraint player_match_stats_nonnegative check (
    passing_td >= 0 and
    interceptions_thrown >= 0 and
    receiving_td >= 0 and
    rushing_td >= 0 and
    catches >= 0 and
    interceptions_caught >= 0 and
    pass_breakups >= 0 and
    xp_earned >= 0
  );

alter table public.player_season_stats
  add constraint player_season_stats_nonnegative check (
    games_played >= 0 and
    wins >= 0 and
    losses >= 0 and
    passing_td >= 0 and
    interceptions_thrown >= 0 and
    receiving_td >= 0 and
    rushing_td >= 0 and
    catches >= 0 and
    interceptions_caught >= 0 and
    pass_breakups >= 0 and
    mvp_awards >= 0 and
    offensive_awards >= 0 and
    defensive_awards >= 0 and
    xp_total >= 0 and
    level > 0
  );

alter table public.player_career_stats
  add constraint player_career_stats_nonnegative check (
    games_played >= 0 and
    wins >= 0 and
    losses >= 0 and
    passing_td >= 0 and
    interceptions_thrown >= 0 and
    receiving_td >= 0 and
    rushing_td >= 0 and
    catches >= 0 and
    interceptions_caught >= 0 and
    pass_breakups >= 0 and
    mvp_awards >= 0 and
    offensive_awards >= 0 and
    defensive_awards >= 0 and
    xp_total >= 0 and
    current_level > 0
  );

alter table public.rank_history
  add constraint rank_history_rating_nonnegative check (rating >= 0);

alter table public.team_records
  add constraint team_records_nonnegative check (
    wins >= 0 and
    losses >= 0 and
    points_for >= 0 and
    points_against >= 0
  );

alter table public.comments
  add constraint comments_body_length check (char_length(body) between 1 and 1000);

alter table public.reactions
  add constraint reactions_emoji_length check (char_length(emoji) between 1 and 16);

alter table public.awards
  add constraint awards_week_positive check (week_number is null or week_number > 0);

alter table public.weekly_summaries
  add constraint weekly_summaries_week_positive check (week_number > 0);

create or replace function public.current_app_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'Admin', false)
$$;

create or replace function public.is_captain_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('Admin', 'Coach'), false)
$$;

alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.team_profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_teams enable row level security;
alter table public.match_rosters enable row level security;
alter table public.player_match_stats enable row level security;
alter table public.player_season_stats enable row level security;
alter table public.player_career_stats enable row level security;
alter table public.badges enable row level security;
alter table public.player_badges enable row level security;
alter table public.awards enable row level security;
alter table public.rank_history enable row level security;
alter table public.xp_history enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.team_records enable row level security;
alter table public.weekly_summaries enable row level security;

create policy "profiles_read_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_self_default_role"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() and role = 'Member');

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid() and
    -- Prevent role escalation: the stored role must match what is currently in the DB
    role = public.current_app_role()
  );

create policy "profiles_admin_manage"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "seasons_read_authenticated"
  on public.seasons for select
  to authenticated
  using (true);

create policy "seasons_admin_manage"
  on public.seasons for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "team_profiles_read_authenticated"
  on public.team_profiles for select
  to authenticated
  using (true);

create policy "team_profiles_admin_manage"
  on public.team_profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "matches_read_authenticated"
  on public.matches for select
  to authenticated
  using (true);

create policy "matches_captain_admin_manage"
  on public.matches for all
  to authenticated
  using (public.is_captain_or_admin())
  with check (public.is_captain_or_admin());

create policy "match_teams_read_authenticated"
  on public.match_teams for select
  to authenticated
  using (true);

create policy "match_teams_captain_admin_manage"
  on public.match_teams for all
  to authenticated
  using (public.is_captain_or_admin())
  with check (public.is_captain_or_admin());

create policy "match_rosters_read_authenticated"
  on public.match_rosters for select
  to authenticated
  using (true);

create policy "match_rosters_captain_admin_manage"
  on public.match_rosters for all
  to authenticated
  using (public.is_captain_or_admin())
  with check (public.is_captain_or_admin());

create policy "player_match_stats_read_authenticated"
  on public.player_match_stats for select
  to authenticated
  using (true);

create policy "player_match_stats_captain_admin_manage"
  on public.player_match_stats for all
  to authenticated
  using (public.is_captain_or_admin())
  with check (public.is_captain_or_admin());

create policy "player_season_stats_read_authenticated"
  on public.player_season_stats for select
  to authenticated
  using (true);

create policy "player_season_stats_admin_manage"
  on public.player_season_stats for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "player_career_stats_read_authenticated"
  on public.player_career_stats for select
  to authenticated
  using (true);

create policy "player_career_stats_admin_manage"
  on public.player_career_stats for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "badges_read_authenticated"
  on public.badges for select
  to authenticated
  using (true);

create policy "badges_admin_manage"
  on public.badges for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "player_badges_read_authenticated"
  on public.player_badges for select
  to authenticated
  using (true);

create policy "player_badges_admin_manage"
  on public.player_badges for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "awards_read_authenticated"
  on public.awards for select
  to authenticated
  using (true);

create policy "awards_admin_manage"
  on public.awards for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "rank_history_read_authenticated"
  on public.rank_history for select
  to authenticated
  using (true);

create policy "rank_history_admin_manage"
  on public.rank_history for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "xp_history_read_authenticated"
  on public.xp_history for select
  to authenticated
  using (true);

create policy "xp_history_admin_manage"
  on public.xp_history for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "comments_read_authenticated"
  on public.comments for select
  to authenticated
  using (true);

create policy "comments_insert_owner"
  on public.comments for insert
  to authenticated
  with check (author_profile_id = auth.uid());

create policy "comments_delete_owner_or_admin"
  on public.comments for delete
  to authenticated
  using (author_profile_id = auth.uid() or public.is_admin());

create policy "reactions_read_authenticated"
  on public.reactions for select
  to authenticated
  using (true);

create policy "reactions_insert_owner"
  on public.reactions for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "reactions_delete_owner_or_admin"
  on public.reactions for delete
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "team_records_read_authenticated"
  on public.team_records for select
  to authenticated
  using (true);

create policy "team_records_admin_manage"
  on public.team_records for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "weekly_summaries_read_authenticated"
  on public.weekly_summaries for select
  to authenticated
  using (true);

create policy "weekly_summaries_admin_manage"
  on public.weekly_summaries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
