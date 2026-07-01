-- Migration 005: SEO/OG metadata fields for page layouts.
alter table page_layouts add column if not exists meta_description text;
alter table page_layouts add column if not exists og_image_url text;
