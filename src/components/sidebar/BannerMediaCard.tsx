import { useDraggable } from "@dnd-kit/core";
import type { MediaItem } from "../../sources/banner-media";

interface Props {
  media: MediaItem;
}

export default function BannerMediaCard({ media }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `media-${media.id}`,
    data: {
      type: "banner",
      mediaId: media.id,
      bannerData: {
        mediaId: media.id,
        imageUrl: media.sourceUrl,
        altText: media.altText || media.title || "",
        linkUrl: "",
        openInNewTab: false,
      },
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={media.title || media.altText || "Banner"}
      style={{
        position: "relative",
        border: "1px solid #e8e8e8",
        borderRadius: "6px",
        background: "#fff",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.45 : 1,
        boxShadow: isDragging
          ? "0 0 0 2px #0070f3, 0 8px 24px rgba(0,0,0,0.12)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          (e.currentTarget as HTMLElement).style.borderColor = "#c8c8c8";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          (e.currentTarget as HTMLElement).style.borderColor = "#e8e8e8";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
        }
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "3 / 2",
          background: "#f2f2f2",
          overflow: "hidden",
        }}
      >
        <img
          src={media.thumbnailUrl}
          alt={media.altText || media.title || ""}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div
        style={{
          padding: "6px 8px",
          fontSize: "10.5px",
          color: "var(--text-secondary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: 1.3,
        }}
      >
        {media.title || media.altText || "Sin título"}
      </div>
    </div>
  );
}
