import type { ComponentType } from "react";

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ContentPage<TItem> {
  items: TItem[];
  pageInfo: PageInfo;
}

// A ContentSource is the seam that lets the Sidebar pull items from N different
// origins (PO articles, EDM articles, WP media, …) through a single contract.
// Each adapter owns its endpoint, its GraphQL query, its mapping to whichever
// shape `ItemCard` consumes, AND the drag payload it produces — the Sidebar
// never has to know any of that.
export interface ContentSource<TItem> {
  id: string;                                  // stable id, used as react-query key
  label: string;                               // tab label shown to the user
  searchPlaceholder?: string;
  defaultPageSize?: number;
  // When set, this source renders sub-tabs instead of its own fetchPage.
  subSources?: ContentSource<unknown>[];
  // How SourceBrowser arranges items. "list" = single column vertical (default).
  // "grid" = 2-column grid (used by visual sources like banner thumbnails).
  layout?: "list" | "grid";
  // Optional component rendered above the search bar (e.g. upload button).
  renderHeader?: ComponentType;
  fetchPage: (
    query: string,
    after: string | null,
    first: number,
    signal?: AbortSignal,
  ) => Promise<ContentPage<TItem>>;
  ItemCard: ComponentType<{ item: TItem }>;    // renders one item; owns its useDraggable
  // Stable key derived from a TItem — keeps SourceBrowser source-agnostic.
  getItemKey: (item: TItem) => string;
  // Optional copy override for the "no results" empty state.
  emptyMessage?: string;
}
