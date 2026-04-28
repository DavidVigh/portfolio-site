-- Add `deleted_count` to the sync audit log so we can see how many repos
-- were pruned on each run (e.g. repos deleted, made private, archived, or
-- transferred to another owner are removed from `github_repos`).

alter table public.github_sync_runs
  add column if not exists deleted_count integer not null default 0;
