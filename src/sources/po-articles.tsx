import { fetchGraphQL } from "../lib/graphql";
import { sizesFromMediaDetails } from "../lib/wpImage";
import ArticleCard from "../components/sidebar/ArticleCard";
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
  const variables: Record<string, unknown> = { first };
  if (after) variables.after = after;
  if (useSearch) variables.search = trimmed;

  try {
    const data = await fetchGraphQL<{
      posts: {
        edges: Array<{ node: PoArticleNode; cursor: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(ENDPOINT, useSearch ? QUERY_WITH_SEARCH : QUERY_LATEST, variables, signal);

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
