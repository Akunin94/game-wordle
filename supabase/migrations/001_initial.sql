-- =============================================================================
-- Uzbek Wordle — initial schema (001)
--
-- Tables:  users, daily_results, achievements
-- View:    leaderboard_summary
--
-- Row Level Security is enabled on every table; policies scope writes to the
-- authenticated owner, reads on the users / leaderboard are open to any
-- signed-in user (needed so players can see each other on the leaderboard).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null check (length(display_name) between 1 and 40),
  avatar_url    text,
  is_ad_free    boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "users_select_all_authenticated" on public.users;
create policy "users_select_all_authenticated"
  on public.users for select
  to authenticated
  using (true);

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
  on public.users for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
  on public.users for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- -----------------------------------------------------------------------------
-- daily_results — one row per (user, date)
-- -----------------------------------------------------------------------------
create table if not exists public.daily_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  date        date not null,
  solved      boolean not null,
  attempts    int check (attempts is null or attempts between 1 and 6),
  word        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists daily_results_user_idx on public.daily_results (user_id);
create index if not exists daily_results_date_idx on public.daily_results (date);

alter table public.daily_results enable row level security;

drop policy if exists "daily_results_select_self" on public.daily_results;
create policy "daily_results_select_self"
  on public.daily_results for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "daily_results_insert_self" on public.daily_results;
create policy "daily_results_insert_self"
  on public.daily_results for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "daily_results_update_self" on public.daily_results;
create policy "daily_results_update_self"
  on public.daily_results for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- achievements — one row per (user, achievement_id)
-- -----------------------------------------------------------------------------
create table if not exists public.achievements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  achievement_id  text not null,
  unlocked_at     timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index if not exists achievements_user_idx on public.achievements (user_id);

alter table public.achievements enable row level security;

drop policy if exists "achievements_select_self" on public.achievements;
create policy "achievements_select_self"
  on public.achievements for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "achievements_insert_self" on public.achievements;
create policy "achievements_insert_self"
  on public.achievements for insert
  to authenticated
  with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- leaderboard_summary — aggregate view
--
-- Implemented as a SQL view over daily_results + users. For very large user
-- bases, consider materializing this and refreshing on a schedule.
-- -----------------------------------------------------------------------------
create or replace view public.leaderboard_summary with (security_invoker = on) as
with streaks as (
  select
    dr.user_id,
    -- gap = days since the previous successful play for this user
    dr.date,
    dr.solved,
    dr.attempts,
    row_number() over (partition by dr.user_id order by dr.date) as rn,
    (dr.date - (row_number() over (partition by dr.user_id order by dr.date))::int) as grp
  from public.daily_results dr
  where dr.solved
),
streak_groups as (
  select
    user_id,
    grp,
    count(*) as streak_len,
    max(date) as last_date
  from streaks
  group by user_id, grp
),
user_streaks as (
  select
    user_id,
    max(streak_len) as max_streak,
    -- current streak = the streak group whose last_date is today or yesterday
    coalesce(
      max(streak_len) filter (where last_date >= current_date - interval '1 day'),
      0
    ) as current_streak
  from streak_groups
  group by user_id
),
user_totals as (
  select
    user_id,
    count(*) filter (where solved) as total_wins,
    avg(attempts) filter (where solved) as avg_attempts
  from public.daily_results
  group by user_id
)
select
  u.id            as user_id,
  u.display_name,
  u.avatar_url,
  coalesce(ut.total_wins, 0)::int       as total_wins,
  coalesce(us.current_streak, 0)::int   as current_streak,
  coalesce(us.max_streak, 0)::int       as max_streak,
  ut.avg_attempts::numeric(4, 2)        as avg_attempts
from public.users u
left join user_totals   ut on ut.user_id = u.id
left join user_streaks  us on us.user_id = u.id;

grant select on public.leaderboard_summary to authenticated;

commit;
