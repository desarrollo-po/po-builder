import { useRef, useState } from "react";
import { useDndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useLayoutStore } from "../../store/layoutStore";
import {
  TEMPLATE_SPECS,
  type ArticleBlock,
  type BannerBlock,
  type CodeBlock,
  type Block,
  type Region,
  type SlotVariant,
} from "../../types/layout";
import logoEdm from "../../assets/logo-edm.png";
import {
  MainLeftArticle,
  MainRightArticle,
  NotaEDM,
  NotaEDMVertical,
  NotaPrincipal,
  SecondaryPhotoArticle,
  SecondarySmallArticle,
  SecondaryTextArticle,
} from "../renderer/cards";

interface Props {
  region: Region;
}

export default function RegionTemplate({ region }: Props) {
  // ponytail: composite layouts handled inline. Extract to a registry when a
  // 4th composite template appears.
  if (region.template === "cuadricula") {
    return <CuadriculaTemplate region={region} />;
  }
  if (region.template === "mas-notas-edm") {
    return <MasNotasEdmTemplate region={region} />;
  }
  if (region.template === "edm-horizontal") {
    return <EdmHorizontalTemplate region={region} />;
  }
  if (region.template === "code-region") {
    return <CodeRegionTemplate region={region} />;
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
  const setBannerHeight = useLayoutStore((s) => s.setBannerHeight);
  const heights = region.bannerHeights ?? [200, 200];

  const spec = TEMPLATE_SPECS.cuadricula;
  const articleSlots = spec.slots.slice(0, 4);
  const bannerSlots = spec.slots.slice(4, 6);

  return (
    <div className="flex min-h-[120px] flex-col gap-2.5 @md:flex-row @md:items-stretch">
      <div
        className="grid flex-2 gap-2.5 @max-md:grid-cols-1!"
        style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}
      >
        {articleSlots.map((slot, i) => (
          <SlotCell key={i} regionId={region.id} slotIndex={i} variant={slot.variant} gridArea="" block={region.blocks[i]} />
        ))}
      </div>

      <div className="flex flex-1 flex-col @max-md:gap-2.5">
        <div style={{ height: heights[0] }} className="min-h-[80px] shrink-0 overflow-hidden">
          <SlotCell regionId={region.id} slotIndex={4} variant={bannerSlots[0].variant} gridArea="" block={region.blocks[4]} fullSize />
        </div>
        <BannerResizeHandle height={heights[0]} onResize={(h) => setBannerHeight(region.id, 0, h)} />
        <div style={{ height: heights[1] }} className="min-h-[80px] shrink-0 overflow-hidden">
          <SlotCell regionId={region.id} slotIndex={5} variant={bannerSlots[1].variant} gridArea="" block={region.blocks[5]} fullSize />
        </div>
        <BannerResizeHandle height={heights[1]} onResize={(h) => setBannerHeight(region.id, 1, h)} />
      </div>
    </div>
  );
}

function BannerResizeHandle({ height, onResize }: { height: number; onResize: (h: number) => void }) {
  const drag = useRef({ active: false, startY: 0, startH: 0 });

  return (
    <div
      className="h-[6px] shrink-0 cursor-row-resize bg-surface-inset transition hover:bg-accent-primary @max-md:hidden"
      title="Arrastrar para redimensionar"
      onPointerDown={(e) => {
        e.preventDefault(); e.stopPropagation();
        drag.current = { active: true, startY: e.clientY, startH: height };
        (e.target as Element).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return;
        const next = Math.min(800, Math.max(80, drag.current.startH + e.clientY - drag.current.startY));
        onResize(next);
      }}
      onPointerUp={(e) => {
        drag.current.active = false;
        (e.target as Element).releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={(e) => {
        drag.current.active = false;
        (e.target as Element).releasePointerCapture(e.pointerId);
      }}
    />
  );
}

function MasNotasEdmTemplate({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS["mas-notas-edm"];
  const leftSlots = spec.slots.slice(0, 9);
  const rightSlots = spec.slots.slice(9, 15);

  return (
    <div className="flex min-h-[120px] flex-col gap-2.5 @md:flex-row @md:items-stretch">
      <div className="grid flex-3 gap-2.5 @max-md:grid-cols-1!" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {leftSlots.map((slot, i) => (
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
      <div className="flex flex-[1.3] flex-col gap-2 bg-red-600 p-2">
        {rightSlots.map((slot, i) => {
          const slotIndex = 9 + i;
          return (
            <SlotCell
              key={slotIndex}
              regionId={region.id}
              slotIndex={slotIndex}
              variant={slot.variant}
              gridArea=""
              block={region.blocks[slotIndex]}
            />
          );
        })}
      </div>
    </div>
  );
}

function EdmHorizontalTemplate({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS["edm-horizontal"];

  return (
    <div className="bg-red-600 p-3">
      <div className="mb-2">
        <img src={logoEdm} alt="EDM" className="h-7 w-auto brightness-0 invert" />
      </div>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {spec.slots.map((slot, i) => (
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
    </div>
  );
}

function CodeRegionTemplate({ region }: { region: Region }) {
  const setCodeColumns = useLayoutStore((s) => s.setCodeColumns);
  const removeCodeColumn = useLayoutStore((s) => s.removeCodeColumn);
  const columns = region.codeColumns ?? 1;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setCodeColumns(region.id, columns - 1)}
          disabled={columns <= 1}
          title="Quitar columna"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-surface-inset bg-white text-sm font-semibold text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="w-5 text-center text-[12px] font-semibold text-text-primary">
          {columns}
        </span>
        <button
          type="button"
          onClick={() => setCodeColumns(region.id, columns + 1)}
          disabled={columns >= 4}
          title="Agregar columna"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-surface-inset bg-white text-sm font-semibold text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>

      <div className="flex min-h-[120px] gap-2.5">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} style={{ width: `calc((100% - ${(columns - 1) * 10}px) / ${columns})` }}>
            <SlotCell
              regionId={region.id}
              slotIndex={i}
              variant="code"
              gridArea=""
              block={region.blocks[i] ?? null}
              onRemoveColumn={columns > 1 ? () => removeCodeColumn(region.id, i) : undefined}
            />
          </div>
        ))}
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
  // code-region only: deletes this column entirely (not just its content).
  // Shown next to the empty-slot "+" — clear the content first to reach it.
  onRemoveColumn?: () => void;
}

function SlotCell({ regionId, slotIndex, variant, gridArea, block, fullSize, onRemoveColumn }: SlotCellProps) {
  const setSlotBlock = useLayoutStore((s) => s.setSlotBlock);
  const [isCreating, setIsCreating] = useState(false);
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
      ? "border border-surface-inset"
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
      {!block && variant === "code" && (
        <div className="absolute right-1.5 top-1.5 z-[2] flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreating(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Agregar contenido"
            className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-surface-inset bg-white/90 p-0 text-lg leading-none text-text-secondary"
          >
            +
          </button>
          {onRemoveColumn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveColumn();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              title="Eliminar columna"
              className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-surface-inset bg-white/90 p-0 text-lg leading-none text-text-secondary"
            >
              ×
            </button>
          )}
        </div>
      )}
      {isCreating && (
        <CodeEditModal
          title="Agregar contenido"
          initialHtml=""
          onSave={(html) => setSlotBlock(regionId, slotIndex, { type: "code", html })}
          onClose={() => setIsCreating(false)}
        />
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
    case "nota-edm":
      return "min-h-[90px]";
    case "nota-edm-vertical":
      return "min-h-[160px]";
    case "banner":
      return "min-h-[120px]";
    case "code":
      return "min-h-[200px]";
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
    case "nota-edm":
      return "Nota EDM";
    case "nota-edm-vertical":
      return "Nota EDM (horizontal)";
    case "banner":
      return "Banner";
    case "code":
      return "Código, nota o banner";
  }
}

function emptyHintForVariant(variant: SlotVariant, isDragging: boolean): string {
  if (!isDragging) return "Slot vacío";
  if (variant === "code") return "Soltar nota, banner o código aquí";
  return variant === "banner" ? "Soltar banner o código aquí" : "Soltar nota aquí";
}

interface SlotBlockProps {
  regionId: string;
  slotIndex: number;
  variant: SlotVariant;
  block: Block;
}

function SlotBlock({ regionId, slotIndex, variant, block }: SlotBlockProps) {
  const clearSlot = useLayoutStore((s) => s.clearSlot);
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
      ) : block.type === "banner" ? (
        <SlotBannerBody
          regionId={regionId}
          slotIndex={slotIndex}
          banner={block}
        />
      ) : (
        <SlotCodeBody regionId={regionId} slotIndex={slotIndex} code={block} variant={variant} />
      )}
      {variant === "code" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            clearSlot(regionId, slotIndex);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title={
            block.type === "banner"
              ? "Quitar banner"
              : block.type === "code"
                ? "Quitar código"
                : "Quitar nota"
          }
          className="absolute right-1.5 top-1.5 z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-md border border-surface-inset bg-white/90 p-0 text-lg leading-none text-text-secondary"
        >
          ×
        </button>
      )}
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

// ── Code: raw HTML/iframe — no live render in-canvas, an embedded iframe
// would swallow the pointer events drag-and-drop needs. ────────────────────
function SlotCodeBody({
  regionId,
  slotIndex,
  code,
  variant,
}: {
  regionId: string;
  slotIndex: number;
  code: CodeBlock;
  variant: SlotVariant;
}) {
  const updateCodeHtml = useLayoutStore((s) => s.updateCodeHtml);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-surface-accent p-3 text-center">
        <span className="font-mono text-base leading-none text-text-tertiary">{"</>"}</span>
        <p className="line-clamp-3 break-all text-[10.5px] text-text-tertiary">
          {code.html.trim() || "Sin contenido"}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        title="Editar código"
        className={`absolute top-1.5 z-[2] flex h-[26px] w-[26px] items-center justify-center border border-surface-inset bg-white/90 p-0 text-lg leading-none text-text-secondary ${variant === "code" ? "right-8" : "right-1.5"}`}
      >
        ✎
      </button>
      {isEditing && (
        <CodeEditModal
          title="Editar código"
          initialHtml={code.html}
          onSave={(html) => updateCodeHtml(regionId, slotIndex, html)}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}

// Editing/creating happens in a fixed-position modal, not inline in the slot
// cell — the slot is too small for a usable textarea and a modal can't
// disturb the region's grid or sibling blocks. Mirrors AddRegionModal's
// overlay pattern. Shared between the pencil-edit flow (SlotCodeBody) and
// the empty-slot quick-create flow (SlotCell, code-region only) via onSave.
function CodeEditModal({
  title,
  initialHtml,
  onSave,
  onClose,
}: {
  title: string;
  initialHtml: string;
  onSave: (html: string) => void;
  onClose: () => void;
}) {
  const [html, setHtml] = useState(initialHtml);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-[min(560px,92vw)] flex-col gap-3.5 rounded-xl border border-surface-inset bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h2 className="m-0 text-[16px] font-semibold text-text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="border-none bg-transparent px-1 text-3xl leading-0 text-text-tertiary hover:text-text-primary"
          >
            ×
          </button>
        </div>

        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={8}
          className="w-full resize-y rounded-lg border border-border-strong bg-white p-3 font-mono text-xs text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-surface-inset bg-white px-4 py-[7px] text-[13px] font-medium text-text-secondary hover:bg-surface-base"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(html);
              onClose();
            }}
            className="rounded-md border-none bg-success px-4 py-[7px] text-[13px] font-semibold text-white hover:brightness-110"
          >
            Guardar
          </button>
        </div>
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
    case "nota-edm":
      return <NotaEDM article={article} />;
    case "nota-edm-vertical":
      return <NotaEDMVertical article={article} />;
    case "banner":
      // Article blocks never appear in banner slots (gated by useDragHandlers).
      return null;
    case "code":
      // code-region slots accept articles too — SecondarySmallArticle is a
      // reasonable default visual across the region's 1-4 column widths.
      return <SecondarySmallArticle article={article} />;
  }
}
