import { fetchGraphQL } from "../lib/graphql";
import BannerMediaCard from "../components/sidebar/BannerMediaCard";
import type { ContentPage, ContentSource } from "./types";

// Shape exposed to ItemCard. Kept independent of the WPGraphQL response so
// the card doesn't have to deal with edges/nodes.
export interface MediaItem {
  id: string;
  title: string;
  altText: string;
  sourceUrl: string;
  thumbnailUrl: string;
}

interface MediaNode {
  id: string;
  title: string | null;
  altText: string | null;
  mediaType: string | null;
  mimeType: string | null;
  sourceUrl: string | null;
  mediaDetails: {
    sizes: Array<{
      name: string | null;
      sourceUrl: string | null;
      width: number | null;
    }> | null;
  } | null;
}

const ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT as string;

// `where.search` filters server-side to assets containing "banner" in title /
// alt / file name. When the user types something, we AND their query with the
// banner constraint so the tab never surfaces non-banner media. A single query
// is enough since $search is always provided.
const QUERY = /* GraphQL */ `
  query GetMedia($search: String!, $after: String, $first: Int!) {
    mediaItems(first: $first, after: $after, where: { search: $search }) {
      edges {
        node {
          id
          title
          altText
          mediaType
          mimeType
          sourceUrl
          mediaDetails {
            sizes {
              name
              sourceUrl
              width
            }
          }
        }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

function pickThumbnail(node: MediaNode): string {
  const sizes = node.mediaDetails?.sizes ?? [];
  // Prefer "medium" first, then any size <= 600px, then fall back to original.
  const medium = sizes.find((s) => s?.name === "medium" && s.sourceUrl);
  if (medium?.sourceUrl) return medium.sourceUrl;

  const small = sizes
    .filter((s): s is { name: string | null; sourceUrl: string; width: number } =>
      Boolean(s?.sourceUrl && typeof s.width === "number"),
    )
    .sort((a, b) => a.width - b.width)
    .find((s) => s.width <= 600);
  if (small?.sourceUrl) return small.sourceUrl;

  return node.sourceUrl ?? "";
}

function isImage(node: MediaNode): boolean {
  if (node.mediaType === "image") return true;
  if (node.mimeType?.startsWith("image/")) return true;
  return false;
}

function toMediaItem(node: MediaNode): MediaItem | null {
  if (!isImage(node) || !node.sourceUrl) return null;
  return {
    id: node.id,
    title: node.title ?? "",
    altText: node.altText ?? "",
    sourceUrl: node.sourceUrl,
    thumbnailUrl: pickThumbnail(node),
  };
}

async function fetchPage(
  query: string,
  after: string | null,
  first: number,
  signal?: AbortSignal,
): Promise<ContentPage<MediaItem>> {
  const trimmed = query.trim();
  const search = trimmed ? `${trimmed} banner` : "banner";
  const variables: Record<string, unknown> = { first, search };
  if (after) variables.after = after;

  try {
    const data = await fetchGraphQL<{
      mediaItems: {
        edges: Array<{ node: MediaNode; cursor: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(ENDPOINT, QUERY, variables, signal);

    if (!data?.mediaItems?.edges) {
      return { items: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    const items = data.mediaItems.edges
      .map((edge) => toMediaItem(edge.node))
      .filter((m): m is MediaItem => m !== null);

    return { items, pageInfo: data.mediaItems.pageInfo };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    console.error("❌ banner-media fetchPage error:", error);
    return { items: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

function ItemCard({ item }: { item: MediaItem }) {
  return <BannerMediaCard media={item} />;
}

export const bannerMedia: ContentSource<MediaItem> = {
  id: "banner-media",
  label: "Banners",
  searchPlaceholder: "Buscar imágenes…",
  defaultPageSize: 18,
  layout: "grid",
  fetchPage,
  ItemCard,
  getItemKey: (item) => item.id,
  emptyMessage: "No se encontraron imágenes",
};
