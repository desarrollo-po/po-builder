import { useDndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useLayoutStore } from "../../store/layoutStore";
import { useVerticalSplit } from "../../hooks/useVerticalSplit";
import {
  TEMPLATE_SPECS,
  type ArticleBlock,
  type BannerBlock,
  type Block,
  type Region,
  type SlotVariant,
} from "../../types/layout";
import {
  MainLeftArticle,
  MainRightArticle,
  NotaPrincipal,
  SecondaryPhotoArticle,
  SecondarySmallArticle,
  SecondaryTextArticle,
} from "../renderer/cards";

interface Props {
  region: Region;
}

export default function RegionTemplate({ region }: Props) {
  // ponytail: composite layout for cuadricula. Generalize when 2nd composite
  // template appears.
  if (region.template === "cuadricula") {
    return <CuadriculaTemplate region={region} />;
  }

  const spec = TEMPLATE_SPECS[region.template];

  return (
    <div
      className="grid min-h-[120px] gap-2.5 @max-md:grid-cols-1! @max-md:[grid-template-rows:none]! @max-md:[grid-template-areas:none]!"
      style={{
        gridTemplateColumns: spec.gridTemplateColumns,
        gridTemplateRows: spec.gridTemplateRows,
        gridTemplateAreas: spec.gridTemplateAreas,
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

function CuadriculaTemplate({ region }: { region: Region }) {
  const setBannerColumnSplit = useLayoutStore((s) => s.setBannerColumnSplit);
  const ratio = region.bannerColumnSplit ?? 0.5;
  const { containerRef, handleProps } = useVerticalSplit({
    ratio,
    onChange: (next) => setBannerColumnSplit(region.id, next),
  });

  const spec = TEMPLATE_SPECS.cuadricula;
  const articleSlots = spec.slots.slice(0, 4);
  const bannerSlots = spec.slots.slice(4, 6);

  return (
    <div className="flex min-h-[120px] flex-col gap-2.5 @md:flex-row @md:items-stretch">
      <div
        className="grid flex-[2] gap-2.5 @max-md:grid-cols-1!"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
        }}
      >
        {articleSlots.map((slot, i) => (
          <SlotCell
            key={i}
            regionId={region.id}
            slotIndex={i}
            variant={slot.variant}
            gridArea=""
            block={region.blocks[i]}
          />
        ))}
      </div>

      <div
        ref={containerRef}
        className="flex flex-[1] flex-col @max-md:gap-2.5"
      >
        <div
          className="flex min-h-[120px] overflow-hidden @md:min-h-0"
          style={{ flexGrow: ratio, flexShrink: 1, flexBasis: 0 }}
        >
          <SlotCell
            regionId={region.id}
            slotIndex={4}
            variant={bannerSlots[0].variant}
            gridArea=""
            block={region.blocks[4]}
            fullSize
          />
        </div>
        <div
          {...handleProps}
          className="h-[6px] shrink-0 cursor-row-resize bg-surface-inset transition hover:bg-accent-primary @max-md:hidden"
          title="Arrastrar para redimensionar"
        />
        <div
          className="flex min-h-[120px] overflow-hidden @md:min-h-0"
          style={{ flexGrow: 1 - ratio, flexShrink: 1, flexBasis: 0 }}
        >
          <SlotCell
            regionId={region.id}
            slotIndex={5}
            variant={bannerSlots[1].variant}
            gridArea=""
            block={region.blocks[5]}
            fullSize
          />
        </div>
      </div>
    </div>
  );
}

interface SlotCellProps {
  regionId: string;
  slotIndex: number;
  variant: SlotVariant;
  gridArea: string;
  block: Block | null;
  // When true, the slot fills its parent (used by composite templates like
  // cuadricula where the parent dictates height via flex).
  fullSize?: boolean;
}

function SlotCell({ regionId, slotIndex, variant, gridArea, block, fullSize }: SlotCellProps) {
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

  const isDropTarget = isOver && !isSourceOfActiveSlot;

  const stateClass = isDropTarget
    ? "border-2 border-accent-primary bg-accent-light ring-2 ring-accent-primary/40"
    : block
      ? "border border-surface-inset bg-white"
      : "border-2 border-dashed border-surface-inset bg-surface-base";

  const sizeClass = fullSize ? "h-full w-full" : minHeightClassFor(variant);

  return (
    <div
      ref={setNodeRef}
      className={`relative overflow-hidden transition @max-md:[grid-area:auto]! ${stateClass} ${sizeClass} ${isSourceOfActiveSlot ? "opacity-40" : "opacity-100"
        }`}
      style={{ gridArea: gridArea || undefined }}
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

function minHeightClassFor(variant: SlotVariant): string {
  switch (variant) {
    case "nota-principal":
      return "min-h-[220px]";
    case "main-left":
      return "min-h-[160px]";
    case "main-right":
      return "min-h-[120px]";
    case "secondary-photo":
      return "min-h-[260px]";
    case "secondary-small":
      return "min-h-[200px]";
    case "secondary-text":
      return "min-h-[180px]";
    case "banner":
      return "min-h-[120px]";
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
      className={`flex h-full flex-col items-center justify-center gap-1 p-3 text-center text-xs ${isOver ? "font-semibold text-accent-primary" : "font-medium text-text-tertiary"
        }`}
    >
      <span>{emptyHintForVariant(variant, active)}</span>
      <span className="text-[10px] opacity-80">{variantLabel(variant)}</span>
    </div>
  );
}

function variantLabel(variant: SlotVariant): string {
  switch (variant) {
    case "nota-principal":
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
      className={`flex h-full cursor-grab flex-col ${isDragging ? "opacity-0" : "opacity-100"}`}
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
        title={block.type === "banner" ? "Quitar banner" : "Quitar nota"}
        className="absolute right-1.5 top-1.5 z-[2] flex h-[22px] w-[22px] items-center justify-center border border-surface-inset bg-white/90 p-0 text-xs leading-none text-text-secondary"
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
    <div className="flex h-full flex-col">
      <div className="min-h-[60px] w-full flex-auto overflow-hidden bg-surface-accent">
        <img
          src={banner.imageUrl}
          alt={banner.altText}
          className="block h-full w-full object-cover"
        />
      </div>
      <div
        className="flex items-center gap-2 border-t border-surface-inset bg-surface-base px-2.5 py-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span
          className={`whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.5px] ${linkInvalid ? "text-amber-700" : "text-text-secondary"
            }`}
        >
          URL
        </span>
        <input
          type="url"
          value={banner.linkUrl}
          onChange={(e) => updateBannerLinkUrl(regionId, slotIndex, e.target.value)}
          placeholder="https://…"
          className={`min-w-0 flex-1 rounded-sm bg-white px-2 py-[5px] text-xs text-text-primary outline-none ${linkInvalid ? "border border-amber-500" : "border border-text-muted"
            }`}
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
    case "nota-principal":
      return <NotaPrincipal article={article} />;
    case "main-left":
      return <MainLeftArticle article={article} />;
    case "main-right":
      return <MainRightArticle article={article} />;
    case "secondary-photo":
      return <SecondaryPhotoArticle article={article} />;
    case "secondary-small":
      return <SecondarySmallArticle article={article} />;
    case "secondary-text":
      return <SecondaryTextArticle article={article} />;
    case "banner":
      // Article blocks never appear in banner slots (gated by useDragHandlers).
      return null;
  }
}
