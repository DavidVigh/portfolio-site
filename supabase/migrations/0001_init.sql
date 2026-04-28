-- Portfolio site database schema.
-- Run this in the Supabase SQL editor (or via the Supabase CLI) once.
-- Idempotent: safe to re-run because every CREATE uses IF NOT EXISTS.

create extension if not exists "pgcrypto";

-- =============================================================
-- Orders (contact / website order submissions)
-- =============================================================
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  email        text not null,
  service      text,
  budget       text,
  timeline     text,
  message      text not null,
  status       text not null default 'new'
                check (status in ('new','in_review','accepted','rejected','completed')),
  source       text
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

-- =============================================================
-- GitHub repositories (synced every 24h by the cron job)
-- =============================================================
create table if not exists public.github_repos (
  id                uuid primary key default gen_random_uuid(),
  repo_id           bigint unique not null,
  name              text not null,
  full_name         text not null,
  description       text,
  html_url          text not null,
  homepage          text,
  stars             integer not null default 0,
  forks             integer not null default 0,
  topics            jsonb not null default '[]'::jsonb,
  primary_language  text,
  languages         jsonb not null default '[]'::jsonb,
  archived          boolean not null default false,
  pushed_at         timestamptz not null,
  updated_at        timestamptz not null,
  last_synced_at    timestamptz not null default now()
);

create index if not exists github_repos_pushed_at_idx
  on public.github_repos (pushed_at desc);

create index if not exists github_repos_updated_at_idx
  on public.github_repos (updated_at desc);

-- =============================================================
-- Sync run audit log
-- =============================================================
create table if not exists public.github_sync_runs (
  id              uuid primary key default gen_random_uuid(),
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  status          text not null
                  check (status in ('success','partial','error')),
  repos_seen      integer not null default 0,
  inserted_count  integer not null default 0,
  updated_count   integer not null default 0,
  error           text
);

create index if not exists github_sync_runs_started_at_idx
  on public.github_sync_runs (started_at desc);

-- =============================================================
-- Row Level Security
-- API routes use the service role key, which bypasses RLS, so we lock
-- down public/anonymous access by default.
-- =============================================================
alter table public.orders         enable row level security;
alter table public.github_repos   enable row level security;
alter table public.github_sync_runs enable row level security;

-- No anon/auth policies are created on purpose. To expose data to the
-- public read path later, add explicit policies here, e.g.:
--
--   create policy "Public can read repos"
--     on public.github_repos
--     for select
--     to anon
--     using (true);
