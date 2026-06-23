-- Create page_layouts table for storing page builder layouts
create table if not exists page_layouts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,
  version      integer not null default 1,
  layout       jsonb not null,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

-- Create unique index for published layouts (one per slug)
create unique index if not exists idx_page_layouts_published
on page_layouts (slug) where is_published = true;

-- Create index for version history queries
create index if not exists idx_page_layouts_slug_version
on page_layouts (slug, version desc);

-- Enable row level security
alter table page_layouts enable row level security;

-- Policy for public read of published layouts.
-- (Postgres does not support `CREATE POLICY IF NOT EXISTS`, so we drop first.)
drop policy if exists "Public read published" on page_layouts;
create policy "Public read published"
on page_layouts
for select
using (is_published = true);

-- Policy granting full access from the builder.
-- NOTE: this opens read/write to the anon role on purpose so the builder works
-- with the public anon key without an auth flow. Tighten this (e.g. require
-- auth.role() = 'authenticated') once a sign-in flow is added.
drop policy if exists "Auth full access" on page_layouts;
create policy "Builder full access"
on page_layouts
for all
using (true)
with check (true);
