import { supabase } from "./supabase";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_W = 1920;
const MAX_H = 1080;

export function validateBannerFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return "Formato no permitido. Usá JPG, PNG o WebP.";
  if (file.size > MAX_BYTES) return "La imagen supera los 3 MB.";
  return null;
}

function compressToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.naturalWidth > MAX_W || img.naturalHeight > MAX_H) {
        reject(new Error(`Dimensiones máximas: ${MAX_W}×${MAX_H} px. La imagen mide ${img.naturalWidth}×${img.naturalHeight}.`));
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compresión fallida"))),
        "image/webp",
        0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
    img.src = url;
  });
}

export async function uploadBanner(file: File): Promise<{ url: string; name: string }> {
  const err = validateBannerFile(file);
  if (err) throw new Error(err);
  const blob = await compressToWebP(file);
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
  const name = `${Date.now()}-${baseName}.webp`;
  const { error } = await supabase.storage
    .from("banners")
    .upload(name, blob, { contentType: "image/webp", upsert: false });
  if (error) throw error;
  const url = supabase.storage.from("banners").getPublicUrl(name).data.publicUrl;
  return { url, name };
}

export async function listBanners(
  search: string,
  offset: number,
  limit: number,
) {
  const { data, error } = await supabase.storage.from("banners").list("", {
    limit,
    offset,
    search: search || undefined,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;
  return (data ?? []).filter((f) => !f.name.startsWith("."));
}
