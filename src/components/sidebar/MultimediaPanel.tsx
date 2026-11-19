import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useTapPlaceStore } from "../../store/tapPlaceStore";
import type { MultimediaBlock } from "../../types/layout";

function extractYoutubeId(url: string): string | undefined {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1];
}

const ACCENT_COLORS = [
  { label: "Gris editorial", value: "#3d4451" },
  { label: "Rojo PO", value: "#9C0015" },
  { label: "Azul profundo", value: "#2c3e50" },
  { label: "Tierra", value: "#5d4e42" },
];

export default function MultimediaPanel() {
  const [platform, setPlatform] = useState<"youtube" | "instagram">("youtube");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customThumb, setCustomThumb] = useState("");
  const [accentColor, setAccentColor] = useState("#3d4451");

  const videoId = platform === "youtube" ? extractYoutubeId(url) : undefined;
  const thumbnailUrl =
    customThumb.trim() ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "");

  const multimediaData: Omit<MultimediaBlock, "type"> = {
    platform,
    url: url.trim(),
    videoId,
    title: title.trim() || (platform === "instagram" ? "Reel Prensa Obrera" : "Video Prensa Obrera"),
    category: category.trim(),
    thumbnailUrl,
    accentColor,
  };

  const dragPayload = {
    type: "multimedia" as const,
    multimediaData,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "sidebar-multimedia-item",
    data: dragPayload,
  });

  const armed = useTapPlaceStore((s) => s.armed);
  const arm = useTapPlaceStore((s) => s.arm);
  const disarm = useTapPlaceStore((s) => s.disarm);
  const isArmed = armed?.id === "sidebar-multimedia-item";

  const handleUrlChange = (nextUrl: string) => {
    setUrl(nextUrl);
    if (nextUrl.includes("instagram.com")) {
      setPlatform("instagram");
    } else if (nextUrl.includes("youtube.com") || nextUrl.includes("youtu.be")) {
      setPlatform("youtube");
    }
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 text-xs">
      <div className="flex gap-1.5 rounded-md bg-white p-1 border border-[var(--border)]">
        <button
          type="button"
          onClick={() => setPlatform("youtube")}
          className={`flex-1 rounded py-1.5 font-semibold transition ${
            platform === "youtube"
              ? "bg-[#9C0015] text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-base)]"
          }`}
        >
          YouTube
        </button>
        <button
          type="button"
          onClick={() => setPlatform("instagram")}
          className={`flex-1 rounded py-1.5 font-semibold transition ${
            platform === "instagram"
              ? "bg-[#9C0015] text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-base)]"
          }`}
        >
          Instagram Reel
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-[var(--text-secondary)]">
          URL del {platform === "youtube" ? "video de YouTube" : "Reel de Instagram"}
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={
            platform === "youtube"
              ? "https://www.youtube.com/watch?v=..."
              : "https://www.instagram.com/reel/..."
          }
          className="rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#0070f3]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-[var(--text-secondary)]">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titular que se mostrará en portada..."
          className="rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#0070f3]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-[var(--text-secondary)]">
          Etiqueta / Programa (opcional)
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={platform === "youtube" ? "Ej: EN VIVO / PODCAST" : "Ej: REEL / POLÍTICA"}
          className="rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#0070f3]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-[var(--text-secondary)]">
          URL de imagen de portada {platform === "youtube" ? "(opcional, se autodetecta)" : "(requerida para Reels)"}
        </label>
        <input
          type="url"
          value={customThumb}
          onChange={(e) => setCustomThumb(e.target.value)}
          placeholder="https://..."
          className="rounded-md border border-[var(--border-strong)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#0070f3]"
        />
      </div>

      {platform === "youtube" && (
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-[var(--text-secondary)]">Color de tarjeta</label>
          <div className="flex gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setAccentColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`h-6 w-6 rounded-full border-2 ${
                  accentColor === c.value ? "border-black scale-110" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tarjeta lista para arrastrar a cualquier slot multimedia */}
      <div className="mt-2 border-t border-[var(--border)] pt-3">
        <p className="mb-2 text-[11px] text-[var(--text-tertiary)]">
          Arrastrá esta tarjeta hacia una región Multimedia (o hacé clic para ubicar):
        </p>
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          onClick={() => {
            if (isArmed) disarm();
            else arm({ id: "sidebar-multimedia-item", type: "multimedia", data: dragPayload });
          }}
          className={`cursor-grab overflow-hidden rounded-lg border bg-white shadow-sm transition ${
            isArmed ? "border-2 border-[#0070f3] ring-2 ring-[#0070f3]/30" : "border-[var(--border-strong)]"
          } ${isDragging ? "opacity-50" : "opacity-100"}`}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={multimediaData.title} className="h-32 w-full object-cover" />
          ) : (
            <div className="flex h-24 w-full items-center justify-center bg-neutral-200 text-[11px] text-neutral-500">
              Vista previa de portada
            </div>
          )}
          <div className="p-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C0015]">
              {platform === "instagram" ? "Instagram Reel" : "YouTube"}
              {category ? ` · ${category}` : ""}
            </span>
            <p className="mt-0.5 line-clamp-2 font-semibold text-[var(--text-primary)]">
              {multimediaData.title}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-1 flex justify-between text-[11px]">
        <a
          href="https://www.youtube.com/@PrensaObreraCom/videos"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0070f3] hover:underline"
        >
          Abrir YouTube PO ↗
        </a>
        <a
          href="https://www.instagram.com/prensaobrera/reels/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0070f3] hover:underline"
        >
          Abrir Reels PO ↗
        </a>
      </div>
    </div>
  );
}