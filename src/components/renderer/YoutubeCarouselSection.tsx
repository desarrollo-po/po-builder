import { useRef } from "react";
import type { Block, MultimediaBlock } from "../../types/layout";
import { MultimediaYoutubeCard } from "./cards";

interface Props {
  blocks: (Block | null)[];
}

export default function YoutubeCarouselSection({ blocks }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const videos = blocks.filter(
    (b): b is MultimediaBlock => b !== null && b.type === "multimedia",
  );

  if (videos.length === 0) return null;

  const handleScroll = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    const offset = direction === "next" ? containerWidth * 0.8 : -containerWidth * 0.8;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="w-full">
      {/* Encabezado editorial con botones de scroll arriba a la derecha */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-neutral-900">
            Multimedia · YouTube
          </h2>
          <a
            href="https://www.youtube.com/@PrensaObreraCom/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#9C0015] hover:underline"
          >
            Ver canal →
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll("prev")}
            aria-label="Anterior"
            style={{
              background: "linear-gradient(180deg, #ff2442 0%, #9C0015 100%)",
              boxShadow: "0 0 14px rgba(255, 36, 66, 0.65)",
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/40 text-base font-extrabold text-white transition duration-200 hover:scale-105 hover:brightness-115 active:scale-95"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => handleScroll("next")}
            aria-label="Siguiente"
            style={{
              background: "linear-gradient(180deg, #ff2442 0%, #9C0015 100%)",
              boxShadow: "0 0 14px rgba(255, 36, 66, 0.65)",
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/40 text-base font-extrabold text-white transition duration-200 hover:scale-105 hover:brightness-115 active:scale-95"
          >
            ›
          </button>
        </div>
      </div>

      {/* Carrusel en una sola fila (4 tarjetas visibles en desktop, deslizable) */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {videos.map((video, idx) => (
          <div
            key={video.videoId || idx}
            className="w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-[calc((100%-36px)/4)]"
          >
            <MultimediaYoutubeCard item={video} />
          </div>
        ))}
      </div>
    </section>
  );
}