import { useQuery } from "@tanstack/react-query";
import { fetchGraphQL } from "../lib/graphql";
import { sizesFromMediaDetails } from "../lib/wpImage";
import ArticleCard from "../components/sidebar/ArticleCard";
import { useLayoutStore } from "../store/layoutStore";
import { useArticleFilterStore } from "../store/articleFilterStore";
import type { ArticleBlock } from "../types/layout";
import type { ContentPage, ContentSource } from "./types";

type ArticleSnapshot = ArticleBlock["snapshot"];

// Raw shape returned by prensaobrera.com's WPGraphQL `posts` query.
interface PoArticleNode {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  campos: {
    descripcionDestacado: string | null;
    descripcion: string | null;
    volanta: string | null;
  } | null;
  categories: {
    edges: Array<{ node: { name: string; slug: string } }>;
  } | null;
  featuredImage: {
    node: {
      sourceUrl: string | null;
      mediaDetails: {
        sizes: Array<{ name: string | null; sourceUrl: string | null }> | null;
      } | null;
    } | null;
  } | null;
}

export interface PoArticleItem {
  id: string;
  snapshot: ArticleSnapshot;
}

const ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT as string;

const QUERY_WITH_SEARCH = /* GraphQL */ `
  query GetPosts($search: String!, $after: String, $first: Int!) {
    posts(first: $first, after: $after, where: { search: $search }) {
      edges {
        node {
          id
          title
          slug
          date
          excerpt
          campos { descripcionDestacado volanta }
          categories { edges { node { name slug } } }
          featuredImage {
            node {
              sourceUrl
              mediaDetails { sizes { name sourceUrl } }
            }
          }
        }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const QUERY_LATEST = /* GraphQL */ `
  query GetPosts($after: String, $first: Int!) {
    posts(first: $first, after: $after) {
      edges {
        node {
          id
          title
          slug
          date
          excerpt
          campos { descripcionDestacado volanta }
          categories { edges { node { name slug } } }
          featuredImage {
            node {
              sourceUrl
              mediaDetails { sizes { name sourceUrl } }
            }
          }
        }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const QUERY_LATEST_BY_TAG = /* GraphQL */ `
  query GetPostsByTag($after: String, $first: Int!, $tagSlug: [String]!) {
    posts(
      first: $first
      after: $after
      where: {
        taxQuery: {
          taxArray: { taxonomy: TAG, terms: $tagSlug, field: SLUG }
        }
      }
    ) {
      edges {
        node {
          id
          title
          slug
          date
          excerpt
          campos { descripcionDestacado volanta }
          categories { edges { node { name slug } } }
          featuredImage {
            node {
              sourceUrl
              mediaDetails { sizes { name sourceUrl } }
            }
          }
        }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const QUERY_LATEST_BY_REGION = /* GraphQL */ `
  query GetPostsByRegion($after: String, $first: Int!, $regionSlug: [String]!) {
    posts(
      first: $first
      after: $after
      where: {
        taxQuery: {
          taxArray: { taxonomy: REGION, terms: $regionSlug, field: SLUG }
        }
      }
    ) {
      edges {
        node {
          id
          title
          slug
          date
          excerpt
          campos { descripcionDestacado volanta }
          categories { edges { node { name slug } } }
          featuredImage {
            node {
              sourceUrl
              mediaDetails { sizes { name sourceUrl } }
            }
          }
        }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

// Curated list of "región" terms editors actually use to lay out the home
// page — the taxonomy has other legacy/unused terms we don't want to show.
const REGION_SLUGS = [
  "fila-multiple",
  "4-columnas-con-foto",
  "cuadricula",
  "4-columnas-sin-foto",
  "Sin descripción\t2-sub-destacado-4",
  "3-notas-principales-b",
  "cultura",
  "Sin descripción\t3-notas-principales-a",
  "1nota-principal",
];

const REGIONES_QUERY = /* GraphQL */ `
  query Regiones($slugs: [String]!) {
    regiones(where: { slug: $slugs }) {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }
`;

export interface RegionTerm {
  id: string;
  name: string;
  slug: string;
}

async function fetchRegions(): Promise<RegionTerm[]> {
  const data = await fetchGraphQL<{
    regiones: { edges: Array<{ node: RegionTerm }> };
  }>(ENDPOINT, REGIONES_QUERY, { slugs: REGION_SLUGS });
  return data?.regiones?.edges.map((edge) => edge.node) ?? [];
}

// Catalog of curated regions — static enough that it never needs a refetch
// within a session.
export function useRegions() {
  return useQuery({
    queryKey: ["po-regiones"],
    queryFn: fetchRegions,
    staleTime: Infinity,
  });
}

function toSnapshot(node: PoArticleNode): ArticleSnapshot {
  return {
    title: node.title ?? "",
    excerpt: node.excerpt,
    descripcionDestacado: node.campos?.descripcionDestacado ?? "",
    descripcion: node.campos?.descripcion ?? "",
    slug: node.slug,
    imageUrl: node.featuredImage?.node?.sourceUrl ?? null,
    imageSizes: sizesFromMediaDetails(node.featuredImage?.node?.mediaDetails?.sizes),
    publishedAt: node.date,
    categoryName: node.categories?.edges?.[0]?.node?.name ?? null,
    categorySlug: node.categories?.edges?.[0]?.node?.slug ?? null,
    volanta: node.campos?.volanta ?? null,
  };
}

async function fetchPage(
  query: string,
  after: string | null,
  first: number,
  signal?: AbortSignal,
): Promise<ContentPage<PoArticleItem>> {
  const trimmed = query.trim();
  const useSearch = trimmed.length > 0;
  // Tag/region filtering only kicks in when the editor is not actively
  // searching — the search box deliberately bypasses both so the user can
  // still pull in articles from outside the filter when they need to.
  // Region is an explicit, session-level filter the editor just picked, so
  // it takes priority over the page's tag when both happen to be set.
  const regionSlug = useArticleFilterStore.getState().regionSlug || null;
  const useRegion = !useSearch && !!regionSlug;
  const pageTagSlug = useLayoutStore.getState().layout?.tag_slug ?? null;
  const useTag = !useSearch && !useRegion && !!pageTagSlug;

  const variables: Record<string, unknown> = { first };
  if (after) variables.after = after;
  if (useSearch) variables.search = trimmed;
  if (useRegion) variables.regionSlug = [regionSlug];
  if (useTag) variables.tagSlug = [pageTagSlug];

  const queryText = useSearch
    ? QUERY_WITH_SEARCH
    : useRegion
      ? QUERY_LATEST_BY_REGION
      : useTag
        ? QUERY_LATEST_BY_TAG
        : QUERY_LATEST;

  try {
    const data = await fetchGraphQL<{
      posts: {
        edges: Array<{ node: PoArticleNode; cursor: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(ENDPOINT, queryText, variables, signal);

    if (!data?.posts?.edges) {
      return { items: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    const items: PoArticleItem[] = data.posts.edges.map((edge) => ({
      id: edge.node.id,
      snapshot: toSnapshot(edge.node),
    }));

    return { items, pageInfo: data.posts.pageInfo };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    console.error("❌ po-articles fetchPage error:", error);
    return { items: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

function ItemCard({ item }: { item: PoArticleItem }) {
  return <ArticleCard articleId={item.id} snapshot={item.snapshot} />;
}

export const poArticles: ContentSource<PoArticleItem> = {
  id: "po-articles",
  label: "Artículos",
  searchPlaceholder: "Buscar artículos…",
  defaultPageSize: 10,
  layout: "list",
  fetchPage,
  ItemCard,
  getItemKey: (item) => item.id,
  emptyMessage: "No se encontraron artículos",
};
