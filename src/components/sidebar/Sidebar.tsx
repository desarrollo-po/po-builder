import { useState } from "react";
import { sources } from "../../sources";
import { useLayoutStore } from "../../store/layoutStore";
import SourceBrowser from "./SourceBrowser";

export default function Sidebar() {
  const [activeSourceId, setActiveSourceId] = useState<string>(
    sources[0]?.id ?? "",
  );

  const activeSource =
    sources.find((s) => s.id === activeSourceId) ?? sources[0];

  // Subscribed so the SourceBrowser remounts (via key) when the editor
  // switches to a page with a different tag — that invalidates react-query's
  // cache and forces a refetch with the new tag in the GraphQL where clause.
  const pageTagSlug = useLayoutStore((s) => s.layout?.tag_slug ?? "");
  const showTagHint = !!pageTagSlug && activeSource?.id === "po-articles";

  return (
    <div
      style={{
        width: "400px",
        background: "#ffffff",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "16px 16px 0", borderBottom: "1px solid var(--border)" }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "var(--text-tertiary)",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Biblioteca de contenido
        </p>

        <div style={{ display: "flex", gap: "4px" }}>
          {sources.map((source) => {
            const isActive = source.id === activeSource?.id;
            return (
              <button
                key={source.id}
                onClick={() => setActiveSourceId(source.id)}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  border: "none",
                  borderRadius: "6px 6px 0 0",
                  background: isActive ? "var(--surface-base)" : "transparent",
                  color: isActive ? "#000000" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 120ms ease-out",
                  borderBottom: isActive ? "2px solid #0070f3" : "2px solid transparent",
                  letterSpacing: 0,
                }}
              >
                {source.label}
              </button>
            );
          })}
        </div>
      </div>

      {showTagHint && (
        <div
          title="Mientras la página tiene un tag, esta tab solo muestra notas con ese tag. Usá el buscador para ver notas de otros tags."
          style={{
            padding: "8px 16px",
            background: "rgba(0,112,243,0.06)",
            borderBottom: "1px solid var(--border)",
            fontSize: "11.5px",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "13px" }}>🏷</span>
          Filtrado por tag:{" "}
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {pageTagSlug}
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto", background: "var(--surface-base)" }}>
        {activeSource && (
          <SourceBrowser
            key={`${activeSource.id}:${pageTagSlug}`}
            source={activeSource}
            cacheKey={pageTagSlug}
          />
        )}
      </div>
    </div>
  );
}
