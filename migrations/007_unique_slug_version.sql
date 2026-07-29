-- Prevent duplicate (slug, version) rows. Without this, two saves racing
-- on the same slug (two tabs, two editors) can insert two rows with the
-- same version, which later makes publishLayout's `.eq("version", ...)`
-- match more than one row and trip idx_page_layouts_published.
--
-- Run this first to check for existing duplicates before applying the
-- constraint below (it will fail if any are found):
--
--   select slug, version, count(*)
--   from page_layouts
--   group by slug, version
--   having count(*) > 1;
--
-- If duplicates exist, resolve them manually (e.g. bump the version of the
-- newer duplicate row) before running the alter statement.

alter table page_layouts
add constraint page_layouts_slug_version_unique unique (slug, version);
