import { useDndContext } from "@dnd-kit/core";
import { useLayoutStore } from "../store/layoutStore";

export default function DragOverlayContent() {
  const { active } = useDndContext();
  const layout = useLayoutStore((s) => s.layout);

  if (!active) return null;
  const activeData = active.data.current;

  // Dragging a block that already lives in a slot
  if (activeData?.kind === "slot-article") {
    const region = layout?.layout.find((r) => r.id === activeData.regionId);
    const block = region?.blocks[activeData.slotIndex as number];
    if (!block) return null;
    if (block.type === "banner") {
      return <BannerPreview imageUrl={block.imageUrl} altText={block.altText} />;
    }
    return <ArticleCardPreview snapshot={block.snapshot} />;
  }

  // Dragging an article from the sidebar
  if (activeData?.type === "article" && activeData?.snapshot) {
    return <ArticleCardPreview snapshot={activeData.snapshot} />;
  }

  // Dragging a banner from the sidebar
  if (activeData?.type === "banner" && activeData?.bannerData) {
    return (
      <BannerPreview
        imageUrl={activeData.bannerData.imageUrl}
        altText={activeData.bannerData.altText}
      />
    );
  }

  return null;
}

function BannerPreview({ imageUrl, altText }: { imageUrl: string; altText: string }) {
  return (
    <div
      style={{
        width: "240px",
        aspectRatio: "3 / 1",
        background: "var(--surface-card)",
        border: "1px solid var(--accent)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-lg)",
        opacity: 0.9,
        pointerEvents: "none",
      }}
    >
      <img
        src={imageUrl}
        alt={altText}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function ArticleCardPreview({
  snapshot,
}: {
  snapshot: {
    title: string;
    excerpt: string;
    imageUrl: string | null;
  };
}) {
  return (
    <div
      style={{
        width: "260px",
        background: "var(--surface-card)",
        border: `1px solid var(--accent)`,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "var(--shadow-lg)",
        opacity: 0.85,
        pointerEvents: "none",
      }}
    >
      {snapshot.imageUrl && (
        <div style={{ width: "100%", height: "140px", background: "var(--surface-secondary)", overflow: "hidden" }}>
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ padding: "10px 12px" }}>
        <h4
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "0 0 6px 0",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snapshot.title}
        </h4>
        {snapshot.excerpt && (
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {snapshot.excerpt}
          </p>
        )}
      </div>
    </div>
  );
}
