import { useState } from "react";
import { useLayoutStore } from "../../store/layoutStore";
import { uploadOgImage } from "../../lib/supabase";

export default function MetadataPanel() {
  const layout = useLayoutStore((s) => s.layout);
  const updateMetadata = useLayoutStore((s) => s.updateMetadata);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Local preview: initialized from saved URL, updated immediately on upload
  // so the img appears without waiting for the store re-render cycle.
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof layout?.og_image_url === "string" ? layout.og_image_url : null,
  );

  if (!layout) {
    return (
      <div style={{ padding: "24px 16px", color: "var(--text-secondary)", fontSize: "13px" }}>
        No hay página cargada.
      </div>
    );
  }

  const textField = (label: string, key: "title" | "meta_description", placeholder?: string) => (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>
        {label}
      </label>
      <input
        defaultValue={layout[key] ?? ""}
        placeholder={placeholder}
        onBlur={(e) => updateMetadata({ [key]: e.target.value } as Parameters<typeof updateMetadata>[0])}
        style={{ width: "100%", padding: "8px 10px", fontSize: "13px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--surface-base)", color: "var(--text-primary)", boxSizing: "border-box" }}
      />
    </div>
  );

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadOgImage(file, layout.slug);
      updateMetadata({ og_image_url: url });
      setPreviewUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px 16px" }}>
      {textField("Título", "title")}
      {textField("Descripción", "meta_description", "Descripción para SEO y redes…")}

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>
          Imagen OG
        </label>

        {previewUrl && (
          <img
            src={previewUrl}
            alt="OG preview"
            style={{ width: "100%", borderRadius: "6px", marginBottom: "8px", border: "1px solid var(--border)", display: "block" }}
          />
        )}

        <label
          style={{
            display: "block",
            padding: "8px 12px",
            fontSize: "13px",
            textAlign: "center",
            border: "1px dashed var(--border)",
            borderRadius: "6px",
            cursor: uploading ? "not-allowed" : "pointer",
            color: uploading ? "var(--text-tertiary)" : "var(--text-secondary)",
            background: "var(--surface-base)",
          }}
        >
          {uploading ? "Subiendo…" : previewUrl ? "Reemplazar imagen" : "Elegir imagen"}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>

        {uploadError && (
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#e53e3e" }}>{uploadError}</p>
        )}
      </div>
    </div>
  );
}
