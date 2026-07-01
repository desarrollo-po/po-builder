import { useState } from "react";
import { useLayoutStore } from "../../store/layoutStore";
import { uploadOgImage } from "../../lib/supabase";

export default function MetadataPanel() {
  const layout = useLayoutStore((s) => s.layout);
  const updateMetadata = useLayoutStore((s) => s.updateMetadata);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof layout?.og_image_url === "string" ? layout.og_image_url : null,
  );

  if (!layout) {
    return (
      <div className="px-xl py-2xl text-text-secondary text-[13px]">
        No hay página cargada.
      </div>
    );
  }

  const textField = (label: string, key: "title" | "meta_description", placeholder?: string) => (
    <div className="mb-5">
      <label className="block text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.6px] mb-1.5">
        {label}
      </label>
      <input
        defaultValue={layout[key] ?? ""}
        placeholder={placeholder}
        onBlur={(e) => updateMetadata({ [key]: e.target.value } as Parameters<typeof updateMetadata>[0])}
        className="w-full px-2.5 py-2 text-[13px] border border-surface-accent rounded-lg bg-white text-text-primary"
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
    <div className="px-xl py-[20px]">
      {textField("Título", "title")}
      {textField("Descripción", "meta_description", "Descripción para SEO y redes…")}

      <div className="mb-5">
        <label className="block text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.6px] mb-1">
          Imagen OG
        </label>
        <div className="flex gap-2 items-start bg-surface-elevated border border-surface-accent rounded-lg px-lg py-2 mb-2">
          <span className="text-[13px] text-text-tertiary mt-px">ℹ</span>
          <p className="text-[11px] text-text-tertiary leading-relaxed">
            1200×630 px recomendado (proporción 1.91:1). Mínimo 600×315 px. Se convierte a WebP automáticamente.
          </p>
        </div>

        {previewUrl && (
          <img
            src={previewUrl}
            alt="OG preview"
            className="w-full rounded-lg mb-2 border border-surface-accent block"
          />
        )}

        <label className={`flex items-center justify-center gap-2 px-lg py-2 text-[13px] border border-dashed border-surface-accent rounded-lg bg-white transition-colors ${uploading ? "cursor-not-allowed text-text-tertiary" : "cursor-pointer text-text-secondary"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          {uploading ? "Subiendo…" : previewUrl ? "Reemplazar imagen" : "Elegir imagen"}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {uploadError && (
          <p className="mt-1.5 text-xs text-error">{uploadError}</p>
        )}
      </div>
    </div>
  );
}
