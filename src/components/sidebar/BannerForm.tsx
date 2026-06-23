import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-lg)",
  fontSize: "13px",
  background: "#ffffff",
  color: "var(--text-primary)",
  outline: "none",
  transition: "all 150ms ease-out",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600 as const,
  color: "var(--text-secondary)",
  letterSpacing: "0.3px",
  textTransform: "uppercase" as const,
  marginBottom: "6px",
};

export default function BannerForm() {
  const [bannerData, setBannerData] = useState({
    imageUrl: "",
    linkUrl: "",
    altText: "",
    openInNewTab: false,
  });

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "new-banner",
    data: { type: "banner", bannerData },
  });

  const isValid = bannerData.imageUrl.trim() && bannerData.linkUrl.trim();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).style.borderColor = "#0070f3";
    (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(0,112,243,0.12)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).style.borderColor = "var(--border-strong)";
    (e.target as HTMLInputElement).style.boxShadow = "none";
  };

  return (
    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <label style={labelStyle}>Image URL</label>
        <input type="url" value={bannerData.imageUrl} onChange={(e) => setBannerData({ ...bannerData, imageUrl: e.target.value })} placeholder="https://..." style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
      </div>

      <div>
        <label style={labelStyle}>Link URL</label>
        <input type="url" value={bannerData.linkUrl} onChange={(e) => setBannerData({ ...bannerData, linkUrl: e.target.value })} placeholder="https://..." style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
      </div>

      <div>
        <label style={labelStyle}>Alt Text</label>
        <input type="text" value={bannerData.altText} onChange={(e) => setBannerData({ ...bannerData, altText: e.target.value })} placeholder="Descripción…" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
        <input type="checkbox" checked={bannerData.openInNewTab} onChange={(e) => setBannerData({ ...bannerData, openInNewTab: e.target.checked })} />
        <span>Abrir en nueva pestaña</span>
      </label>

      {/* Drag zone */}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          padding: "14px 12px",
          border: `2px dashed ${isValid ? "#0070f3" : "var(--border-strong)"}`,
          borderRadius: "var(--radius-lg)",
          textAlign: "center",
          transition: "all 150ms ease-out",
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "grabbing" : isValid ? "grab" : "default",
          background: isValid ? "rgba(0,112,243,0.06)" : "var(--surface-secondary)",
        }}
      >
        <p style={{ fontSize: "13px", fontWeight: 500, color: isValid ? "#0070f3" : "var(--text-tertiary)", margin: 0 }}>
          {isValid ? "Arrastrar para agregar banner" : "Completar campos para habilitar"}
        </p>
      </div>

      {/* Preview */}
      {bannerData.imageUrl && (
        <div style={{ padding: "8px", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--surface-secondary)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "8px" }}>Vista previa</p>
          <img src={bannerData.imageUrl} alt={bannerData.altText} style={{ width: "100%", height: "96px", objectFit: "cover", borderRadius: "var(--radius-md)" }} />
        </div>
      )}
    </div>
  );
}
