import { fetchGraphQL } from "../lib/graphql";
import { sizesFromMediaDetails } from "../lib/wpImage";
import ArticleCard from "../components/sidebar/ArticleCard";
import type { ArticleBlock } from "../types/layout";
import type { ContentPage, ContentSource } from "./types";

type ArticleSnapshot = ArticleBlock["snapshot"];

// Raw shape from revistaedm.com's WPGraphQL. Note the different fields:
// the bajada lives under `campos_de_entrada` (vs PO's `campos`), and EDM
// exposes `autores` and `link` which PO does not.
interface EdmArticleNode {
  id: string;
  title: string;
  slug: string;
  date: string;
  link: string | null;
  autores: {
    edges: Array<{ node: { name: string } }>;
  } | null;
  campos_de_entrada: {
    bajada: string | null;
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

export interface EdmArticleItem {
  id: string;
  snapshot: ArticleSnapshot;
}

const ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT_EDM as string;

// EDM only ever surfaces articles from the "EDM Digital" category, so the
// taxQuery is baked into both queries. The free-text search filter is added
// on top when present.
const QUERY_WITH_SEARCH = /* GraphQL */ `
  query GetEdmPosts($search: String!, $after: String, $first: Int!) {
    posts(
      first: $first
      after: $after
      where: {
        search: $search
        taxQuery: {
          taxArray: { taxonomy: CATEGORY, terms: "EDM Digital", field: NAME }
        }
      }
    ) {
      edges {
        node {
          id
          title
          slug
          date
          link
          autores { edges { node { name } } }
          campos_de_entrada { bajada volanta }
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
  query GetEdmPosts($after: String, $first: Int!) {
    posts(
      first: $first
      after: $after
      where: {
        taxQuery: {
          taxArray: { taxonomy: CATEGORY, terms: "EDM Digital", field: NAME }
        }
      }
    ) {
      edges {
        node {
          id
          title
          slug
          date
          link
          autores { edges { node { name } } }
          campos_de_entrada { bajada volanta }
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

function toSnapshot(node: EdmArticleNode): ArticleSnapshot {
  // EDM has fields PO lacks (author, link). Until ArticleSnapshot grows to
  // accommodate them, we squeeze the author into the volanta slot as a
  // fallback so it's not lost on the way to the slot preview.
  const authorName = node.autores?.edges?.[0]?.node?.name ?? null;
  const volanta = node.campos_de_entrada?.volanta ?? authorName;

  return {
    title: node.title ?? "",
    excerpt: node.campos_de_entrada?.bajada ?? "",
    slug: node.slug,
    imageUrl: node.featuredImage?.node?.sourceUrl ?? null,
    imageSizes: sizesFromMediaDetails(node.featuredImage?.node?.mediaDetails?.sizes),
    publishedAt: node.date,
    categoryName: node.categories?.edges?.[0]?.node?.name ?? "EDM Digital",
    volanta,
  };
}

async function fetchPage(
  query: string,
  after: string | null,
  first: number,
  signal?: AbortSignal,
): Promise<ContentPage<EdmArticleItem>> {
  if (!ENDPOINT) {
    console.warn(
      "VITE_GRAPHQL_ENDPOINT_EDM is not set. The EDM source will return empty results.",
    );
    return { items: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }

  const trimmed = query.trim();
  const useSearch = trimmed.length > 0;
  const variables: Record<string, unknown> = { first };
  if (after) variables.after = after;
  if (useSearch) variables.search = trimmed;

  try {
    const data = await fetchGraphQL<{
      posts: {
        edges: Array<{ node: EdmArticleNode; cursor: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(ENDPOINT, useSearch ? QUERY_WITH_SEARCH : QUERY_LATEST, variables, signal);

    if (!data?.posts?.edges) {
      return { items: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    const items: EdmArticleItem[] = data.posts.edges.map((edge) => ({
      id: edge.node.id,
      snapshot: toSnapshot(edge.node),
    }));

    return { items, pageInfo: data.posts.pageInfo };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    console.error("❌ edm-articles fetchPage error:", error);
    return { items: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }
}

function ItemCard({ item }: { item: EdmArticleItem }) {
  return <ArticleCard articleId={item.id} snapshot={item.snapshot} />;
}

export const edmArticles: ContentSource<EdmArticleItem> = {
  id: "edm-articles",
  label: "EDM",
  searchPlaceholder: "Buscar en EDM…",
  defaultPageSize: 10,
  layout: "list",
  fetchPage,
  ItemCard,
  getItemKey: (item) => item.id,
  emptyMessage: "No se encontraron artículos en EDM",
};
