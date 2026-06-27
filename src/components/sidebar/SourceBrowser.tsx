import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ContentSource } from "../../sources/types";

interface Props<TItem> {
  source: ContentSource<TItem>;
  // Extra discriminator appended to react-query's queryKey so cache from a
  // sibling context (e.g. a different page's tag filter) doesn't bleed in.
  // The component remount via `key` only resets local state — react-query's
  // cache is global and matches on queryKey.
  cacheKey?: string;
}

function ListSkeleton() {
  return (
    <div className="flex animate-pulse gap-2 rounded-lg border border-surface-inset p-2">
      <div className="h-[72px] w-[72px] shrink-0 rounded bg-surface-accent" />
      <div className="flex flex-1 flex-col gap-1.5 py-1">
        <div className="h-2 w-1/3 rounded bg-surface-accent" />
        <div className="h-2.5 w-full rounded bg-surface-accent" />
        <div className="h-2.5 w-4/5 rounded bg-surface-accent" />
        <div className="mt-1 h-2 w-1/4 rounded bg-surface-accent" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-md border border-surface-inset">
      <div className="aspect-[3/2] bg-surface-accent" />
      <div className="p-1.5">
        <div className="h-2 w-3/4 rounded bg-surface-accent" />
      </div>
    </div>
  );
}

// One browser to rule them all: it consumes the ContentSource contract and
// stays oblivious to whether it's listing articles, EDM posts, banner media,
// or anything we plug in next. Layout (list vs grid), search placeholder,
// empty-state copy and page size all come from the source.
export default function SourceBrowser<TItem>({ source, cacheKey = "" }: Props<TItem>) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue.trim()), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Reset the input whenever the user flips between source tabs so the new
  // tab doesn't inherit a stale query from the previous one.
  useEffect(() => {
    setInputValue("");
    setDebouncedQuery("");
  }, [source.id]);

  const pageSize = source.defaultPageSize ?? 10;
  const searchPageSize = Math.max(pageSize, 20);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [source.id, debouncedQuery, cacheKey],
      queryFn: ({ pageParam, signal }) =>
        source.fetchPage(
          debouncedQuery,
          pageParam ?? null,
          debouncedQuery ? searchPageSize : pageSize,
          signal,
        ),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) =>
        lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
      staleTime: 1000 * 60 * 2,
    });

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const isGrid = source.layout === "grid";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "12px", gap: "10px" }}>
      <div style={{ position: "relative" }}>
        <svg
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "14px",
            height: "14px",
            color: "var(--text-tertiary)",
            pointerEvents: "none",
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={source.searchPlaceholder ?? "Buscar…"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px 8px 32px",
            border: "1px solid var(--border-strong)",
            background: "#ffffff",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none",
            transition: "all 150ms ease-out",
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = "#0070f3";
            (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(0,112,243,0.12)";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = "var(--border-strong)";
            (e.target as HTMLInputElement).style.boxShadow = "none";
          }}
        />
      </div>

      {error && (
        <div
          style={{
            fontSize: "12px",
            color: "#0070f3",
            background: "rgba(0,112,243,0.07)",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(0,112,243,0.20)",
          }}
        >
          {error instanceof Error ? error.message : "Error al cargar"}
        </div>
      )}

      {items.length === 0 && !isLoading && debouncedQuery && (
        <div style={{ textAlign: "center", paddingTop: "32px", color: "var(--text-tertiary)", fontSize: "13px" }}>
          {source.emptyMessage ?? "Sin resultados"}
        </div>
      )}

      <div
        style={
          isGrid
            ? { flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", alignContent: "start" }
            : { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }
        }
      >
        {isLoading
          ? Array.from({ length: pageSize }, (_, i) =>
              isGrid ? <GridSkeleton key={i} /> : <ListSkeleton key={i} />
            )
          : items.map((item) => {
              const ItemCard = source.ItemCard;
              return <ItemCard key={source.getItemKey(item)} item={item} />;
            })
        }
      </div>

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full rounded-lg border border-surface-inset bg-white py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-accent hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetchingNextPage ? "Cargando…" : "Cargar más"}
        </button>
      )}
    </div>
  );
}
