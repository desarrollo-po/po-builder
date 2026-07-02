import type { ContentSource } from "./types";
import { poArticles } from "./po-articles";
import { edmArticles } from "./edm-articles";
import { bannerMedia } from "./banner-media";
import { supabaseBanners } from "./supabase-banners";

// Ordered registry of every content source the Sidebar should surface.
// Adding a new source = appending an entry here. Sidebar derives its tabs
// from this array, in this order.
export const sources: ContentSource<unknown>[] = [
  poArticles as ContentSource<unknown>,
  edmArticles as ContentSource<unknown>,
  supabaseBanners as ContentSource<unknown>,
  bannerMedia as ContentSource<unknown>,
];

export { poArticles, edmArticles, bannerMedia, supabaseBanners };
