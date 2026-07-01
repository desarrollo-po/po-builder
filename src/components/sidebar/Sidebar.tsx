import { useState } from "react";
import { sources } from "../../sources";
import { useLayoutStore } from "../../store/layoutStore";
import SourceBrowser from "./SourceBrowser";
import MetadataPanel from "./MetadataPanel";

export default function Sidebar() {
  const [activeSourceId, setActiveSourceId] = useState<string>(
    sources[0]?.id ?? "",
  );
  const [mode, setMode] = useState<"contenido" | "metadata">("contenido");

  const activeSource =
    sources.find((s) => s.id === activeSourceId) ?? sources[0];

  // Subscribed so the SourceBrowser remounts (via key) when the editor
  // switches to a page with a different tag — that invalidates react-query's
  // cache and forces a refetch with the new tag in the GraphQL where clause.
  const pageTagSlug = useLayoutStore((s) => s.layout?.tag_slug ?? "");
  const pageId = useLayoutStore((s) => s.layout?.id ?? "");
  const showTagHint = !!pageTagSlug && activeSource?.id === "po-articles" && mode === "contenido";

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
      <div style={{ padding: "12px 16px 0", borderBottom: "1px solid var(--border)" }}>
        {/* Primary segmented control */}
        <div style={{
          display: "flex",
          background: "var(--surface-base)",
          borderRadius: "8px",
          padding: "3px",
          gap: "2px",
          marginBottom: "12px",
        }}>
          {(["contenido", "metadata"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                borderRadius: "6px",
                background: mode === m ? "#ffffff" : "transparent",
                color: mode === m ? "#000000" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 120ms ease-out",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
              }}
            >
              {m === "contenido" ? "Contenido" : "Metadata"}
            </button>
          ))}
        </div>

        {/* Source sub-tabs — only in contenido mode */}
        {mode === "contenido" && (
          <div style={{ display: "flex", gap: "2px" }}>
            {sources.map((source) => {
              const isActive = source.id === activeSource?.id;
              return (
                <button
                  key={source.id}
                  onClick={() => setActiveSourceId(source.id)}
                  style={{
                    flex: 1,
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 500,
                    border: "none",
                    borderRadius: "4px 4px 0 0",
                    background: "transparent",
                    color: isActive ? "#0070f3" : "var(--text-tertiary)",
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
        )}
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
        {mode === "metadata" ? (
          <MetadataPanel key={pageId} />
        ) : (
          activeSource && (
            <SourceBrowser
              key={`${activeSource.id}:${pageTagSlug}`}
              source={activeSource}
              cacheKey={pageTagSlug}
            />
          )
        )}
      </div>
    </div>
  );
}
