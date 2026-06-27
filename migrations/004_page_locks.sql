-- Migration 004: page locking for concurrent edit protection.
-- One row per slug; upserted on enter, deleted on leave, expires after 5 min.
create table if not exists public.page_locks (
  slug       text primary key,
  locked_by  text not null,
  locked_at  timestamptz not null default now()
);

alter table public.page_locks enable row level security;

drop policy if exists "Authenticated full access to page_locks" on public.page_locks;
create policy "Authenticated full access to page_locks"
  on public.page_locks
  for all
  to authenticated
  using (true)
  with check (true);
