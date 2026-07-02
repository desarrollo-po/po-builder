import type { ContentSource } from "./types";
import { poArticles } from "./po-articles";
import { edmArticles } from "./edm-articles";
import { bannerMedia } from "./banner-media";
import { supabaseBanners } from "./supabase-banners";

const banners: ContentSource<never> = {
  id: "banners",
  label: "Banners",
  subSources: [bannerMedia as ContentSource<unknown>, supabaseBanners as ContentSource<unknown>],
  // ponytail: stubs — never called when subSources is set
  fetchPage: async () => ({ items: [], pageInfo: { hasNextPage: false, endCursor: null } }),
  ItemCard: () => null,
  getItemKey: () => "",
};

export const sources: ContentSource<unknown>[] = [
  poArticles as ContentSource<unknown>,
  edmArticles as ContentSource<unknown>,
  banners as unknown as ContentSource<unknown>,
];

export { poArticles, edmArticles, bannerMedia, supabaseBanners };
