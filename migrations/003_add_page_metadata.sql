-- Add per-page metadata (title + optional WP tag slug) to page_layouts.
-- Lists of pages are derived from DISTINCT ON (slug) over this table;
-- no separate `pages` table.

alter table page_layouts add column if not exists title text;
alter table page_layouts add column if not exists tag_slug text;

-- Backfill the only pre-existing page so it has a friendly title.
update page_layouts set title = 'Home' where slug = 'home' and title is null;

-- Speed up the "latest row per slug" query used by listPages().
create index if not exists idx_page_layouts_slug_created
on page_layouts (slug, created_at desc);
