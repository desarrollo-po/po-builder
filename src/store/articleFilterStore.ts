import { create } from "zustand";

interface ArticleFilterState {
  regionSlug: string; // "" = sin filtro
  setRegionSlug: (slug: string) => void;
}

export const useArticleFilterStore = create<ArticleFilterState>((set) => ({
  regionSlug: "",
  setRegionSlug: (regionSlug) => set({ regionSlug }),
}));
