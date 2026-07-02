import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { uploadBanner, validateBannerFile } from "../lib/bannerStorage";
import { listBanners } from "../lib/bannerStorage";
import BannerMediaCard from "../components/sidebar/BannerMediaCard";
import type { ContentPage, ContentSource } from "./types";
import type { MediaItem } from "./banner-media";

const SOURCE_ID = "supabase-banners";

function UploadHeader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationErr = validateBannerFile(file);
    if (validationErr) {
      setError(validationErr);
      e.target.value = "";
      return;
    }
    setError(null);
    setUploading(true);
    try {
      await uploadBanner(file);
      qc.invalidateQueries({ queryKey: [SOURCE_ID] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", background: "#fff" }}>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          background: uploading ? "var(--surface-accent)" : "#0070f3",
          color: "#fff",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: uploading ? "default" : "pointer",
          opacity: uploading ? 0.7 : 1,
          transition: "opacity 120ms",
          userSelect: "none",
        }}
      >
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: "none" }}
          onChange={handleChange}
          disabled={uploading}
        />
        {uploading ? "Subiendo…" : "↑ Subir imagen"}
      </label>
      <span style={{ marginLeft: "8px", fontSize: "10.5px", color: "var(--text-tertiary)" }}>
        JPG · PNG · WebP · máx 3 MB · 1920×1080
      </span>
      {error && (
        <div style={{ marginTop: "6px", fontSize: "11px", color: "#d32f2f", background: "rgba(211,47,47,0.06)", padding: "6px 8px", borderRadius: "4px" }}>
          {error}
        </div>
      )}
    </div>
  );
}

async function fetchPage(
  query: string,
  after: string | null,
  first: number,
): Promise<ContentPage<MediaItem>> {
  const offset = after ? parseInt(after, 10) : 0;
  const files = await listBanners(query.trim(), offset, first);
  const items: MediaItem[] = files.map((f) => {
    const url = supabase.storage.from("banners").getPublicUrl(f.name).data.publicUrl;
    const displayName = f.name.replace(/^\d+-/, "").replace(/\.webp$/, "").replace(/-/g, " ");
    return {
      id: f.name,
      title: displayName,
      altText: displayName,
      sourceUrl: url,
      thumbnailUrl: url,
    };
  });
  return {
    items,
    pageInfo: {
      hasNextPage: files.length === first,
      endCursor: files.length === first ? String(offset + first) : null,
    },
  };
}

function ItemCard({ item }: { item: MediaItem }) {
  return <BannerMediaCard media={item} />;
}

export const supabaseBanners: ContentSource<MediaItem> = {
  id: SOURCE_ID,
  label: "Banners",
  searchPlaceholder: "Filtrar banners…",
  defaultPageSize: 18,
  layout: "grid",
  renderHeader: UploadHeader,
  fetchPage,
  ItemCard,
  getItemKey: (item) => item.id,
  emptyMessage: "No hay banners subidos. Usá el botón de arriba para subir uno.",
};
