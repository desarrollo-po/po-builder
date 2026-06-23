import { useDraggable } from "@dnd-kit/core";
import { getSectionColor } from "../../lib/sectionColors";
import type { ArticleBlock } from "../../types/layout";

type ArticleSnapshot = ArticleBlock["snapshot"];

interface Props {
  articleId: string;
  snapshot: ArticleSnapshot;
}

// Pure visual + draggable for any article-shaped sidebar item. Both the PO
// articles adapter and the EDM articles adapter render their items through
// this — each one is responsible for mapping its raw GraphQL node into the
// ArticleSnapshot shape before handing it over.
export default function ArticleCard({ articleId, snapshot }: Props) {
  const sectionColor = getSectionColor(snapshot.categoryName);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `article-${articleId}`,
    data: {
      type: "article",
      articleId,
      snapshot,
    },
  });

  const date = snapshot.publishedAt
    ? new Date(snapshot.publishedAt).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="group select-none"
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        border: "1px solid #e8e8e8",
        borderRadius: "6px",
        minHeight: "100px",
        background: "#fff",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.45 : 1,
        transition: "border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
        boxShadow: isDragging
          ? "0 0 0 2px #0070f3, 0 8px 24px rgba(0,0,0,0.12)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transform: isDragging ? "scale(1.01)" : "scale(1)",
        position: "relative",
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
      {/* Section accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: sectionColor,
          zIndex: 1,
        }}
      />

      {/* Image column */}
      <div
        style={{
          width: "72px",
          aspectRatio: "1 / 0",
          background: "#f2f2f2",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {snapshot.imageUrl ? (
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 300ms ease",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Content column */}
      <div
        style={{
          padding: "8px 10px 8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          minWidth: 0,
          justifyContent: "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
          {snapshot.volanta ? (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: sectionColor,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1,
              }}
            >
              {snapshot.volanta}
            </span>
          ) : snapshot.categoryName ? (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: sectionColor,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1,
              }}
            >
              {snapshot.categoryName}
            </span>
          ) : (
            <span />
          )}

          {date && (
            <span
              style={{
                fontSize: "9px",
                color: "#aaa",
                fontWeight: 500,
                whiteSpace: "nowrap",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {date}
            </span>
          )}
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "11.5px",
            fontWeight: 600,
            color: "#111",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            letterSpacing: "-0.1px",
          }}
        >
          {snapshot.title}
        </p>

        {snapshot.volanta && snapshot.categoryName && (
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: "9px",
                fontWeight: 600,
                color: "#666",
                background: "#f2f2f2",
                padding: "2px 6px",
                borderRadius: "3px",
                letterSpacing: "0.3px",
              }}
            >
              {snapshot.categoryName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
