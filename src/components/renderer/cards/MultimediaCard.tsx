import { useState } from "react";
import { createPortal } from "react-dom";
import type { MultimediaBlock } from "../../../types/layout";

export function MultimediaReelCard({ item }: { item: MultimediaBlock }) {
  return (
    <a
      href={item.url || "https://www.instagram.com/prensaobrera/reels/"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col text-neutral-900 no-underline"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-neutral-200">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-xs text-white/70">
            Instagram Reel
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 transition group-hover:bg-black/30">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>

      {item.category && (
        <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          {item.category}
        </span>
      )}
      <h3
        className={`${
          item.category ? "mt-1" : "mt-2"
        } text-sm font-bold leading-snug group-hover:underline`}
      >
        {item.title}
      </h3>
    </a>
  );
}

export function MultimediaYoutubeCard({ item }: { item: MultimediaBlock }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (item.videoId) setOpenModal(true);
          else window.open(item.url || "https://www.youtube.com/@PrensaObreraCom/videos", "_blank");
        }}
        style={{ backgroundColor: item.accentColor || "#3d4451" }}
        className="group relative flex h-48 w-full overflow-hidden rounded-md text-left text-white transition hover:opacity-95"
      >
        <div className="flex w-[52%] flex-col justify-between p-3.5">
          <div>
            {item.category && (
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/80">
                {item.category}
              </span>
            )}
            <h3 className="line-clamp-4 text-sm font-bold leading-tight">
              {item.title}
            </h3>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 translate-x-0.5 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>

        <div className="h-full w-[48%] overflow-hidden bg-black/30">
          {item.thumbnailUrl && (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
      </button>

      {openModal &&
        item.videoId &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setOpenModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              padding: "16px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "min(960px, 92vw)",
                height: "min(540px, 51.75vw)",
                backgroundColor: "#000",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  zIndex: 10,
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: "9999px",
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✕ Cerrar
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}