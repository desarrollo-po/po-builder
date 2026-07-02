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
    <div className="px-3 py-2 border-b border-[var(--border)] bg-white flex flex-col gap-1.5">
      <label className={`flex items-center justify-center gap-2 px-3 py-2 text-[13px] border border-dashed border-[var(--surface-accent)] rounded-lg bg-white transition-colors ${uploading ? "cursor-not-allowed text-[var(--text-tertiary)]" : "cursor-pointer text-[var(--text-secondary)] hover:border-[#0070f3] hover:text-[#0070f3]"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
        {uploading ? "Subiendo…" : "Subir imagen"}
        <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleChange} disabled={uploading} />
      </label>
      <p className="text-[10.5px] text-[var(--text-tertiary)] text-center">JPG · PNG · WebP · máx 3 MB · 1920×1080</p>
      {error && (
        <p className="text-[11px] text-[#d32f2f] bg-[rgba(211,47,47,0.06)] px-2 py-1.5 rounded">{error}</p>
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
