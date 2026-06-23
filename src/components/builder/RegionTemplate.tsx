import { useDndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useLayoutStore } from "../../store/layoutStore";
import {
  TEMPLATE_SPECS,
  type ArticleBlock,
  type BannerBlock,
  type Block,
  type Region,
  type SlotVariant,
} from "../../types/layout";
import { getSectionColor } from "../../lib/sectionColors";

interface Props {
  region: Region;
}

export default function RegionTemplate({ region }: Props) {
  const spec = TEMPLATE_SPECS[region.template];

  return (
    <div
      style={{
        display: "grid",
        gap: "10px",
        gridTemplateColumns: spec.gridTemplateColumns,
        gridTemplateRows: spec.gridTemplateRows,
        gridTemplateAreas: spec.gridTemplateAreas,
        minHeight: "120px",
      }}
    >
      {spec.slots.map((slot, slotIndex) => (
        <SlotCell
          key={slotIndex}
          regionId={region.id}
          slotIndex={slotIndex}
          variant={slot.variant}
          gridArea={slot.gridArea}
          block={region.blocks[slotIndex]}
        />
      ))}
    </div>
  );
}

interface SlotCellProps {
  regionId: string;
  slotIndex: number;
  variant: SlotVariant;
  gridArea: string;
  block: Block | null;
}

function SlotCell({ regionId, slotIndex, variant, gridArea, block }: SlotCellProps) {
  const { active } = useDndContext();
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${regionId}:${slotIndex}`,
    data: { kind: "slot", regionId, slotIndex },
  });

  const isDraggingSomething = !!active;
  const activeData = active?.data.current;
  const isSourceOfActiveSlot =
    activeData?.kind === "slot-article" &&
    activeData.regionId === regionId &&
    activeData.slotIndex === slotIndex;

  return (
    <div
      ref={setNodeRef}
      style={{
        gridArea,
        position: "relative",
        minHeight: minHeightForVariant(variant),
        border: block
          ? "1px solid var(--border)"
          : isOver
            ? "2px solid var(--accent)"
            : "2px dashed var(--border)",
        background: block
          ? "var(--surface-card)"
          : isOver
            ? "var(--accent-light)"
            : "var(--surface-base)",
        transition: "all 120ms ease-out",
        overflow: "hidden",
        opacity: isSourceOfActiveSlot ? 0.4 : 1,
      }}
    >
      {block ? (
        <SlotBlock
          regionId={regionId}
          slotIndex={slotIndex}
          variant={variant}
          block={block}
        />
      ) : (
        <EmptySlotHint variant={variant} active={isDraggingSomething} isOver={isOver} />
      )}
    </div>
  );
}

function minHeightForVariant(variant: SlotVariant): string {
  switch (variant) {
    case "hero":
      return "220px";
    case "main-left":
      return "160px";
    case "main-right":
      return "120px";
    case "secondary-photo":
      return "260px";
    case "secondary-small":
      return "200px";
    case "secondary-text":
      return "180px";
    case "banner":
      return "120px";
  }
}

function EmptySlotHint({
  variant,
  active,
  isOver,
}: {
  variant: SlotVariant;
  active: boolean;
  isOver: boolean;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "12px",
        textAlign: "center",
        color: isOver ? "var(--accent)" : "var(--text-tertiary)",
        fontSize: "12px",
        fontWeight: isOver ? 600 : 500,
      }}
    >
      <span>{emptyHintForVariant(variant, active)}</span>
      <span style={{ fontSize: "10px", opacity: 0.8 }}>{variantLabel(variant)}</span>
    </div>
  );
}

function variantLabel(variant: SlotVariant): string {
  switch (variant) {
    case "hero":
      return "Hero";
    case "main-left":
      return "Principal grande";
    case "main-right":
      return "Principal chica";
    case "secondary-photo":
      return "Secundaria con foto";
    case "secondary-small":
      return "Secundaria chica";
    case "secondary-text":
      return "Sin foto";
    case "banner":
      return "Banner";
  }
}

function emptyHintForVariant(variant: SlotVariant, isDragging: boolean): string {
  if (!isDragging) return "Slot vacío";
  return variant === "banner" ? "Soltar banner aquí" : "Soltar nota aquí";
}

interface SlotBlockProps {
  regionId: string;
  slotIndex: number;
  variant: SlotVariant;
  block: Block;
}

function SlotBlock({ regionId, slotIndex, variant, block }: SlotBlockProps) {
  const { clearSlot } = useLayoutStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `slot-article:${regionId}:${slotIndex}`,
    data: { kind: "slot-article", regionId, slotIndex },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: isDragging ? 0 : 1,
        cursor: "grab",
      }}
      {...attributes}
      {...listeners}
    >
      {block.type === "article" ? (
        <SlotArticleBody variant={variant} article={block} />
      ) : (
        <SlotBannerBody
          regionId={regionId}
          slotIndex={slotIndex}
          banner={block}
        />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          clearSlot(regionId, slotIndex);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          background: "rgba(255, 255, 255, 0.92)",
          border: "1px solid var(--border)",
          width: "22px",
          height: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: "12px",
          lineHeight: 1,
          padding: 0,
          zIndex: 2,
        }}
        title={block.type === "banner" ? "Quitar banner" : "Quitar nota"}
      >
        ×
      </button>
    </div>
  );
}

// ── Banner: imagen full-width + input para la URL de destino ───────────────
function SlotBannerBody({
  regionId,
  slotIndex,
  banner,
}: {
  regionId: string;
  slotIndex: number;
  banner: BannerBlock;
}) {
  const updateBannerLinkUrl = useLayoutStore((s) => s.updateBannerLinkUrl);
  const linkInvalid = !banner.linkUrl.trim();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          width: "100%",
          flex: "1 1 auto",
          minHeight: "60px",
          background: "var(--surface-secondary)",
          overflow: "hidden",
        }}
      >
        <img
          src={banner.imageUrl}
          alt={banner.altText}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div
        style={{
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-base)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            color: linkInvalid ? "#b45309" : "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            whiteSpace: "nowrap",
          }}
        >
          URL
        </span>
        <input
          type="url"
          value={banner.linkUrl}
          onChange={(e) => updateBannerLinkUrl(regionId, slotIndex, e.target.value)}
          placeholder="https://…"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "5px 8px",
            border: `1px solid ${linkInvalid ? "#f59e0b" : "var(--border-strong)"}`,
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            color: "var(--text-primary)",
            background: "#ffffff",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function SlotArticleBody({
  variant,
  article,
}: {
  variant: SlotVariant;
  article: ArticleBlock;
}) {
  switch (variant) {
    case "hero":
      return <HeroCard article={article} />;
    case "main-left":
      return <MainLeftCard article={article} />;
    case "main-right":
      return <MainRightCard article={article} />;
    case "secondary-photo":
      return <SecondaryPhotoCard article={article} />;
    case "secondary-small":
      return <SecondarySmallCard article={article} />;
    case "secondary-text":
      return <SecondaryTextCard article={article} />;
    case "banner":
      // Article blocks never appear in banner slots (gated by useDragHandlers).
      return null;
  }
}

// ── Hero (nota-principal): foto izquierda, texto derecha grande ────────────
function HeroCard({ article }: { article: ArticleBlock }) {
  const { snapshot } = article;
  const sectionColor = getSectionColor(snapshot.categoryName);
  return (
    <div style={{ height: "100%", display: "flex", gap: "14px" }}>
      {snapshot.imageUrl && (
        <div
          style={{
            width: "45%",
            background: "var(--surface-secondary)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: "14px 16px 14px 0",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          justifyContent: "flex-start",
        }}
      >
        {snapshot.volanta && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: sectionColor,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h3
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snapshot.title}
        </h3>
        {snapshot.excerpt && (
          <p
            style={{
              margin: 0,
              fontSize: "12.5px",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 3,
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

// ── Main-left (tres-notas-principales): foto arriba full, título debajo ────
function MainLeftCard({ article }: { article: ArticleBlock }) {
  const { snapshot } = article;
  const sectionColor = getSectionColor(snapshot.categoryName);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {snapshot.imageUrl && (
        <div
          style={{
            width: "100%",
            flex: "1 1 65%",
            background: "var(--surface-secondary)",
            overflow: "hidden",
          }}
        >
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {snapshot.volanta && (
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              color: sectionColor,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h3
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snapshot.title}
        </h3>
      </div>
    </div>
  );
}

// ── Main-right (tres-notas-principales chicas): foto izq + texto abajo ───────
function MainRightCard({ article }: { article: ArticleBlock }) {
  const { snapshot } = article;
  const sectionColor = getSectionColor(snapshot.categoryName);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {snapshot.imageUrl && (
        <div
          style={{
            width: "100%",
            background: "var(--surface-secondary)",
            overflow: "hidden",
            height: "150px",
            flexShrink: 0,
          }}
        >
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: "15px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          justifyContent: "flex-start",
        }}
      >
        {snapshot.volanta && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: sectionColor,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h4
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snapshot.title}
        </h4>
        {snapshot.excerpt && (
          <span 
            style={{
              fontSize: "14px",
              lineHeight: "1.2",
              fontWeight: 200,
          }}>
            {snapshot.excerpt}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Secondary-photo (dos-notas-secundarias): foto arriba + título + bajada ─
function SecondaryPhotoCard({ article }: { article: ArticleBlock }) {
  const { snapshot } = article;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {snapshot.imageUrl && (
        <div
          style={{
            width: "100%",
            flex: "1 1 60%",
            background: "var(--surface-secondary)",
            overflow: "hidden",
          }}
        >
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <h4
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snapshot.title}
        </h4>
        {snapshot.excerpt && (
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              color: "var(--text-secondary)",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
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

// ── Secondary-small (tres/cuatro secundarias): foto arriba + título corto ──
function SecondarySmallCard({ article }: { article: ArticleBlock }) {
  const { snapshot } = article;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {snapshot.imageUrl && (
        <div
          style={{
            width: "100%",
            flex: "1 1 55%",
            background: "var(--surface-secondary)",
            overflow: "hidden",
          }}
        >
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "3px" }}>
        <h4
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snapshot.title}
        </h4>
      </div>
    </div>
  );
}

// ── Secondary-text (4 notas sin foto): borde superior coloreado + texto ────
function SecondaryTextCard({ article }: { article: ArticleBlock }) {
  const { snapshot } = article;
  const accent = getSectionColor(snapshot.categoryName);
  return (
    <div
      style={{
        height: "100%",
        padding: "14px 14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        borderTop: `3px solid ${accent}`,
      }}
    >
      {snapshot.volanta && (
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: 800,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: "0.7px",
          }}
        >
          {snapshot.volanta}
        </span>
      )}
      <h4
        style={{
          margin: 0,
          fontSize: "14px",
          fontWeight: 800,
          color: "var(--text-primary)",
          lineHeight: 1.25,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {snapshot.title}
      </h4>
      {snapshot.excerpt && (
        <p
          style={{
            margin: 0,
            fontSize: "11.5px",
            color: "var(--text-secondary)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snapshot.excerpt}
        </p>
      )}
    </div>
  );
}
