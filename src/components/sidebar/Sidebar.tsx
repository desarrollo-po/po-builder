import { useState } from "react";
import { sources } from "../../sources";
import SourceBrowser from "./SourceBrowser";

export default function Sidebar() {
  const [activeSourceId, setActiveSourceId] = useState<string>(
    sources[0]?.id ?? "",
  );

  const activeSource =
    sources.find((s) => s.id === activeSourceId) ?? sources[0];

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

      <div style={{ flex: 1, overflow: "auto", background: "var(--surface-base)" }}>
        {activeSource && (
          <SourceBrowser key={activeSource.id} source={activeSource} />
        )}
      </div>
    </div>
  );
}
