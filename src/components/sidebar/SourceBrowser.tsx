import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ContentSource } from "../../sources/types";

interface Props<TItem> {
  source: ContentSource<TItem>;
}

// One browser to rule them all: it consumes the ContentSource contract and
// stays oblivious to whether it's listing articles, EDM posts, banner media,
// or anything we plug in next. Layout (list vs grid), search placeholder,
// empty-state copy and page size all come from the source.
export default function SourceBrowser<TItem>({ source }: Props<TItem>) {
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
      queryKey: [source.id, debouncedQuery],
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

      {isLoading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "32px", paddingBottom: "32px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Cargando…</span>
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
            ? {
                flex: 1,
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                alignContent: "start",
              }
            : {
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }
        }
      >
        {items.map((item) => {
          const ItemCard = source.ItemCard;
          return <ItemCard key={source.getItemKey(item)} item={item} />;
        })}
      </div>

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          style={{
            width: "100%",
            padding: "9px 16px",
            fontSize: "12px",
            fontWeight: 500,
            background: "#ffffff",
            border: "1px solid var(--border-strong)",
            color: "var(--text-secondary)",
            borderRadius: "8px",
            cursor: isFetchingNextPage ? "not-allowed" : "pointer",
            opacity: isFetchingNextPage ? 0.5 : 1,
            transition: "all 120ms ease-out",
          }}
          onMouseEnter={(e) => {
            if (!isFetchingNextPage) {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-secondary)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
          }}
        >
          {isFetchingNextPage ? "Cargando…" : "Cargar más"}
        </button>
      )}
    </div>
  );
}
