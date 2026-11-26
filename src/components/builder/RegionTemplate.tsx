import { Fragment, useEffect, useRef, useState } from "react";
import { useDndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useLayoutStore } from "../../store/layoutStore";
import { useTapPlaceStore } from "../../store/tapPlaceStore";
import { applySourceToSlot } from "../../hooks/useDragHandlers";
import { edmArticles } from "../../sources/edm-articles";
import {
  TEMPLATE_SPECS,
  TEMPLATE_MOBILE_BREAKPOINT,
  slotAccepts,
  codeColumnWidthsFor,
  type ArticleBlock,
  type BannerBlock,
  type CodeBlock,
  type Block,
  type Region,
  type SlotVariant,
} from "../../types/layout";
import logoEdm from "../../assets/logo-edm.svg";
import {
  MainLeftArticle,
  MainRightArticle,
  NotaEDM,
  NotaEDMVertical,
  NotaEDMFlexible,
  NotaPrincipal,
  SecondaryPhotoArticle,
  SecondarySmallArticle,
  SecondaryTextArticle,
} from "../renderer/cards";

interface Props {
  region: Region;
}

const GRID_MOBILE_CLASSES: Record<number, string> = {
  512: "@max-[512px]:grid-cols-1! @max-[512px]:[grid-template-rows:none]! @max-[512px]:[grid-template-areas:none]!",
  736: "@max-[736px]:grid-cols-1! @max-[736px]:[grid-template-rows:none]! @max-[736px]:[grid-template-areas:none]!",
  700: "@max-[700px]:grid-cols-1! @max-[700px]:[grid-template-rows:none]! @max-[700px]:[grid-template-areas:none]!",
};
const DEFAULT_GRID_MOBILE_CLASSES = "@max-md:grid-cols-1! @max-md:[grid-template-rows:none]! @max-md:[grid-template-areas:none]!";

const SLOT_MOBILE_CLASSES: Record<number, string> = {
  512: "@max-[512px]:[grid-area:auto]!",
  736: "@max-[736px]:[grid-area:auto]!",
  700: "@max-[700px]:[grid-area:auto]!",
};
const DEFAULT_SLOT_MOBILE_CLASSES = "@max-md:[grid-area:auto]!";

export default function RegionTemplate({ region }: Props) {
  if (region.template === "cuadricula") {
    return <CuadriculaTemplate region={region} />;
  }
  if (region.template === "mas-notas-edm") {
    return <MasNotasEdmTemplate region={region} />;
  }
  if (region.template === "edm-horizontal") {
    return <EdmHorizontalTemplate region={region} />;
  }
  if (region.template === "edm-carrusel") {
    return <EdmCarruselTemplate region={region} />;
  }
  if (region.template === "code-region") {
    return <CodeRegionTemplate region={region} />;
  }

  const spec = TEMPLATE_SPECS[region.template];
  const breakpoint = TEMPLATE_MOBILE_BREAKPOINT[region.template];
  const gridClasses = breakpoint ? GRID_MOBILE_CLASSES[breakpoint] : DEFAULT_GRID_MOBILE_CLASSES;
  const slotClasses = breakpoint ? SLOT_MOBILE_CLASSES[breakpoint] : DEFAULT_SLOT_MOBILE_CLASSES;

  return (
    <div
      className={`grid min-h-[120px] gap-2.5 ${gridClasses}`}
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
          gridAreaResetClass={slotClasses}
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
    <div className="flex min-h-[120px] flex-col gap-2.5 @[512px]:flex-row @[512px]:items-stretch">
      <div
        className="grid flex-2 gap-2.5 @max-[512px]:grid-cols-1!"
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
  const clearSlot = useLayoutStore((s) => s.clearSlot);
  const leftSlots = spec.slots.slice(0, 9);
  const rightSlots = spec.slots.slice(9);
  const [autoBlocks, setAutoBlocks] = useState<ArticleBlock[]>([]);
  const [isLoadingAuto, setIsLoadingAuto] = useState(false);

  const fetchLatestEdm = async (signal?: AbortSignal) => {
    setIsLoadingAuto(true);
    try {
      const res = await edmArticles.fetchPage("", null, 7, signal);
      const blocks: ArticleBlock[] = res.items.slice(0, 7).map((item) => ({
        type: "article",
        articleId: item.id,
        snapshot: item.snapshot,
      }));
      setAutoBlocks(blocks);
    } catch {
      // Ignorar errores de abort o red
    } finally {
      setIsLoadingAuto(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    edmArticles
      .fetchPage("", null, 7, controller.signal)
      .then((res) => {
        const blocks: ArticleBlock[] = res.items.slice(0, 7).map((item) => ({
          type: "article",
          articleId: item.id,
          snapshot: item.snapshot,
        }));
        setAutoBlocks(blocks);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const hasManualEdmOverrides = rightSlots.some((_, i) => region.blocks[9 + i] !== null);

  const handleResetEdmToAuto = () => {
    rightSlots.forEach((_, i) => {
      if (region.blocks[9 + i]) {
        clearSlot(region.id, 9 + i);
      }
    });
    fetchLatestEdm();
  };

  return (
    <div className="flex min-h-[120px] flex-col gap-2.5 @[736px]:flex-row @[736px]:items-stretch">
      <div className="grid flex-3 gap-2.5 @max-[736px]:grid-cols-1!" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
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

      <div className="flex flex-[1.3] flex-col gap-2.5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#19191d] via-[#131316] to-[#0d0d10] p-3 shadow-[0_14px_36px_-10px_rgba(0,0,0,0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <img src={logoEdm} alt="EDM" className="h-5 w-auto" />
            <span className="border-l border-white/15 pl-2.5 font-mono text-[11px] font-light uppercase tracking-[0.22em] text-[#e23b1a]">
              [ÚLTIMOS ARTÍCULOS]
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-neutral-200 backdrop-blur-md">
              {hasManualEdmOverrides ? "Mixto" : "Auto · 7"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fetchLatestEdm()}
              disabled={isLoadingAuto}
              title="Refrescar últimas 7 notas de EDM"
              className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-50"
            >
              {isLoadingAuto ? "…" : "Actualizar"}
            </button>
            {hasManualEdmOverrides && (
              <button
                type="button"
                onClick={handleResetEdmToAuto}
                title="Quitar notas fijadas manualmente y volver al modo 100% automático"
                className="rounded-full bg-[#e23b1a] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-[0_0_15px_rgba(226,59,26,0.6)] transition hover:bg-[#ff4621]"
              >
                Volver a auto
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-2">
          {rightSlots.map((slot, i) => {
            const slotIndex = 9 + i;
            const manualBlock = region.blocks[slotIndex] ?? null;
            const autoBlock = autoBlocks[i] ?? null;

            return (
              <div key={slotIndex} className="relative flex-1 overflow-hidden rounded-xl">
                {manualBlock ? (
                  <SlotCell
                    regionId={region.id}
                    slotIndex={slotIndex}
                    variant={slot.variant}
                    gridArea=""
                    block={manualBlock}
                    fullSize
                    borderless
                  />
                ) : (
                  <div className="relative h-full">
                    <SlotCell
                      regionId={region.id}
                      slotIndex={slotIndex}
                      variant={slot.variant}
                      gridArea=""
                      block={null}
                      fullSize
                      borderless
                    />
                    {autoBlock && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                        <NotaEDM article={autoBlock} />
                        <span className="absolute bottom-1.5 right-2 rounded-full border border-white/20 bg-black/70 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-md">
                          Auto #{i + 1}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
      <div className="grid gap-2.5 @max-[1100px]:grid-cols-1!" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
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

function EdmCarruselTemplate({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS["edm-carrusel"];
  const clearSlot = useLayoutStore((s) => s.clearSlot);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [autoBlocks, setAutoBlocks] = useState<ArticleBlock[]>([]);
  const [isLoadingAuto, setIsLoadingAuto] = useState(false);

  const fetchLatestEdm = async (signal?: AbortSignal) => {
    setIsLoadingAuto(true);
    try {
      const res = await edmArticles.fetchPage("", null, 7, signal);
      const blocks: ArticleBlock[] = res.items.slice(0, 7).map((item) => ({
        type: "article",
        articleId: item.id,
        snapshot: item.snapshot,
      }));
      setAutoBlocks(blocks);
    } catch {
      // Ignorar errores de abort o red
    } finally {
      setIsLoadingAuto(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    edmArticles
      .fetchPage("", null, 7, controller.signal)
      .then((res) => {
        const blocks: ArticleBlock[] = res.items.slice(0, 7).map((item) => ({
          type: "article",
          articleId: item.id,
          snapshot: item.snapshot,
        }));
        setAutoBlocks(blocks);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const hasManualOverrides = region.blocks.some((b) => b !== null);

  const handleResetToAuto = () => {
    spec.slots.forEach((_, i) => {
      if (region.blocks[i]) {
        clearSlot(region.id, i);
      }
    });
    fetchLatestEdm();
  };

  const scrollLeftEdm = () => {
    carouselRef.current?.scrollBy({ left: -270, behavior: "smooth" });
  };

  const scrollRightEdm = () => {
    carouselRef.current?.scrollBy({ left: 270, behavior: "smooth" });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#19191d] via-[#131316] to-[#0d0d10] py-4 shadow-[0_14px_36px_-10px_rgba(0,0,0,0.6)]">
      {/* Cabecera oscura con logo rojo, [ÚLTIMOS ARTÍCULOS], controles y flechas arriba a la derecha */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-5">
        <div className="flex flex-wrap items-center gap-3">
          <img src={logoEdm} alt="EDM" className="h-6 w-auto" />
          <span className="border-l border-white/15 pl-3 font-mono text-xs font-light uppercase tracking-[0.22em] text-[#e23b1a]">
            [ÚLTIMOS ARTÍCULOS]
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-neutral-200 backdrop-blur-md">
            {hasManualOverrides ? "Mixto (manual + auto)" : "Automático · últimas 7"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fetchLatestEdm()}
            disabled={isLoadingAuto}
            title="Refrescar últimas 7 notas de EDM"
            className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-50"
          >
            {isLoadingAuto ? "Cargando…" : "Actualizar"}
          </button>
          {hasManualOverrides && (
            <button
              type="button"
              onClick={handleResetToAuto}
              title="Quitar notas fijadas manualmente y volver al modo 100% automático"
              className="rounded-full bg-[#e23b1a] px-3 py-1 text-xs font-semibold text-white shadow-[0_0_15px_rgba(226,59,26,0.6)] transition hover:bg-[#ff4621]"
            >
              Volver a auto
            </button>
          )}
          <div className="ml-1 flex items-center gap-1.5">
            <button
              type="button"
              onClick={scrollLeftEdm}
              title="Desplazar a la izquierda"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#e23b1a] text-base leading-none text-white shadow-[0_0_14px_rgba(226,59,26,0.65)] backdrop-blur-md transition hover:scale-105 hover:bg-[#ff4621] hover:shadow-[0_0_22px_rgba(255,70,33,0.9)]"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={scrollRightEdm}
              title="Desplazar a la derecha"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#e23b1a] text-base leading-none text-white shadow-[0_0_14px_rgba(226,59,26,0.65)] backdrop-blur-md transition hover:scale-105 hover:bg-[#ff4621] hover:shadow-[0_0_22px_rgba(255,70,33,0.9)]"
            >
              &#8250;
            </button>
          </div>
        </div>
      </div>

      {/* Pista del carrusel */}
      <div
        ref={carouselRef}
        className="flex gap-3.5 overflow-x-auto px-5 pb-2 scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:mx-5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#e23b1a]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#ff4621]/80"
      >
        {spec.slots.map((slot, i) => {
          const manualBlock = region.blocks[i] ?? null;
          const autoBlock = autoBlocks[i] ?? null;

          return (
            <div
              key={i}
              className="relative min-w-[235px] max-w-[255px] shrink-0 overflow-hidden rounded-xl shadow-md"
            >
              {manualBlock ? (
                <SlotCell
                  regionId={region.id}
                  slotIndex={i}
                  variant={slot.variant}
                  gridArea=""
                  block={manualBlock}
                  borderless
                />
              ) : (
                <div className="relative h-full">
                  <SlotCell
                    regionId={region.id}
                    slotIndex={i}
                    variant={slot.variant}
                    gridArea=""
                    block={null}
                    borderless
                  />
                  {autoBlock && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                      <NotaEDMVertical article={autoBlock} />
                      <span className="absolute left-2 top-2 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                        Auto #{i + 1}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CodeRegionTemplate({ region }: { region: Region }) {
  const setCodeColumns = useLayoutStore((s) => s.setCodeColumns);
  const removeCodeColumn = useLayoutStore((s) => s.removeCodeColumn);
  const setCodeColumnWidths = useLayoutStore((s) => s.setCodeColumnWidths);
  const columns = region.codeColumns ?? 1;
  const weights = codeColumnWidthsFor(region);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const gapTotal = (columns - 1) * 10;

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

      <div className="flex min-h-[120px] items-start">
        {Array.from({ length: columns }, (_, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <CodeColumnResizeHandle
                weights={weights}
                index={i - 1}
                onResize={(next) => setCodeColumnWidths(region.id, next)}
              />
            )}
            <div style={{ width: `calc((100% - ${gapTotal}px) * ${weights[i] / totalWeight})` }}>
              <SlotCell
                regionId={region.id}
                slotIndex={i}
                variant="code"
                gridArea=""
                block={region.blocks[i] ?? null}
                onRemoveColumn={columns > 1 ? () => removeCodeColumn(region.id, i) : undefined}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function CodeColumnResizeHandle({
  weights,
  index,
  onResize,
}: {
  weights: number[];
  index: number;
  onResize: (next: number[]) => void;
}) {
  const drag = useRef({ active: false, startX: 0, startWeights: weights, availablePx: 0 });

  return (
    <div
      className="group flex w-[10px] shrink-0 cursor-col-resize items-center justify-center"
      title="Arrastrar para redimensionar"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const container = (e.currentTarget.parentElement as HTMLElement) ?? e.currentTarget;
        const availablePx = container.getBoundingClientRect().width - (weights.length - 1) * 10;
        drag.current = { active: true, startX: e.clientX, startWeights: weights, availablePx };
        (e.target as Element).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return;
        const { startX, startWeights, availablePx } = drag.current;
        const total = startWeights.reduce((a, b) => a + b, 0);
        const minWeight = total * 0.15;
        const deltaWeight = ((e.clientX - startX) / availablePx) * total;
        const a = startWeights[index] + deltaWeight;
        const b = startWeights[index + 1] - deltaWeight;
        if (a < minWeight || b < minWeight) return;
        const next = [...startWeights];
        next[index] = a;
        next[index + 1] = b;
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
    >
      <div className="h-8 w-[3px] rounded-full bg-surface-inset transition group-hover:bg-accent-primary" />
    </div>
  );
}

interface SlotCellProps {
  regionId: string;
  slotIndex: number;
  variant: SlotVariant;
  gridArea: string;
  block: Block | null;
  fullSize?: boolean;
  borderless?: boolean;
  onRemoveColumn?: () => void;
  gridAreaResetClass?: string;
}

function SlotCell({
  regionId,
  slotIndex,
  variant,
  gridArea,
  block,
  fullSize,
  borderless,
  onRemoveColumn,
  gridAreaResetClass = DEFAULT_SLOT_MOBILE_CLASSES,
}: SlotCellProps) {
  const layout = useLayoutStore((s) => s.layout);
  const setSlotBlock = useLayoutStore((s) => s.setSlotBlock);
  const updateBannerImageMobile = useLayoutStore((s) => s.updateBannerImageMobile);
  const [isCreating, setIsCreating] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<"desktop" | "mobile">("desktop");
  const { active } = useDndContext();
  const isBannerMobileTarget = block?.type === "banner" && bannerPreview === "mobile";
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${regionId}:${slotIndex}`,
    data: { kind: "slot", regionId, slotIndex, targetMobileImage: isBannerMobileTarget },
  });

  const isArmedTarget = useTapPlaceStore(
    (s) => !!s.armed && slotAccepts(variant, s.armed.type),
  );

  const isDraggingSomething = !!active;
  const activeData = active?.data.current;
  const isSourceOfActiveSlot =
    activeData?.kind === "slot-article" &&
    activeData.regionId === regionId &&
    activeData.slotIndex === slotIndex;

  const isDropTarget = isOver && !isSourceOfActiveSlot;
  const looksEmpty = !block || (isBannerMobileTarget && block.type === "banner" && !block.imageUrlMobile);

  const stateClass = isDropTarget || isArmedTarget
    ? "rounded-xl ring-2 ring-[#e23b1a] bg-white/15 backdrop-blur-md"
    : borderless
      ? "rounded-xl border-none bg-white/5"
      : looksEmpty
        ? "border-2 border-dashed border-surface-inset bg-surface-base"
        : "border border-surface-inset";

  const sizeClass = fullSize ? "h-full w-full" : minHeightClassFor(variant);

  const handleTapPlace = () => {
    const { armed, disarm } = useTapPlaceStore.getState();
    if (!armed || !layout) return;
    if (!slotAccepts(variant, armed.type)) return;
    applySourceToSlot(
      layout,
      { setSlotBlock, updateBannerImageMobile },
      { regionId, slotIndex, targetMobileImage: isBannerMobileTarget },
      armed.data,
    );
    disarm();
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleTapPlace}
      className={`relative overflow-hidden transition ${gridAreaResetClass} ${stateClass} ${sizeClass} ${isSourceOfActiveSlot ? "opacity-40" : "opacity-100"
        }`}
      style={{ gridArea: gridArea || undefined }}
    >
      {block ? (
        <SlotBlock
          regionId={regionId}
          slotIndex={slotIndex}
          variant={variant}
          block={block}
          bannerPreview={bannerPreview}
          onBannerPreviewChange={setBannerPreview}
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
  bannerPreview: "desktop" | "mobile";
  onBannerPreviewChange: (mode: "desktop" | "mobile") => void;
}

function SlotBlock({ regionId, slotIndex, variant, block, bannerPreview, onBannerPreviewChange }: SlotBlockProps) {
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
          preview={bannerPreview}
          onPreviewChange={onBannerPreviewChange}
        />
      ) : (
        <SlotCodeBody regionId={regionId} slotIndex={slotIndex} code={block} />
      )}
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
        className="absolute right-2 top-2 z-[2] flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white/85 p-0 text-base leading-none text-text-secondary shadow-sm backdrop-blur-md transition hover:bg-white"
      >
        ×
      </button>
    </div>
  );
}

function IconMonitor() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function IconSmartphone() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function SlotBannerBody({
  regionId,
  slotIndex,
  banner,
  preview,
  onPreviewChange,
}: {
  regionId: string;
  slotIndex: number;
  banner: BannerBlock;
  preview: "desktop" | "mobile";
  onPreviewChange: (mode: "desktop" | "mobile") => void;
}) {
  const updateBannerLinkUrl = useLayoutStore((s) => s.updateBannerLinkUrl);
  const updateBannerImageMobile = useLayoutStore((s) => s.updateBannerImageMobile);
  const linkInvalid = !banner.linkUrl.trim();
  const showMobileEmpty = preview === "mobile" && !banner.imageUrlMobile;

  return (
    <div className="flex h-full flex-col">
      <div
        className="min-h-[60px] w-full flex-auto overflow-hidden bg-surface-accent"
        onPointerDown={preview === "mobile" ? (e) => e.stopPropagation() : undefined}
      >
        {showMobileEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-[10.5px] font-medium text-text-tertiary">
            <span>Arrastrá una imagen desde la columna izquierda</span>
          </div>
        ) : (
          <img
            src={preview === "mobile" ? banner.imageUrlMobile : banner.imageUrl}
            alt={banner.altText}
            className="block h-full w-full object-cover"
          />
        )}
      </div>
      <div
        className="flex flex-col gap-1.5 border-t border-surface-inset bg-surface-base px-2.5 py-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Vista del banner"
            className="flex overflow-hidden rounded-sm gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={preview === "desktop"}
              onClick={() => onPreviewChange("desktop")}
              title="Ver versión desktop"
              className={`flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.5px] transition-colors ${preview === "desktop" ? "bg-accent-primary text-white" : "bg-white text-text-secondary hover:bg-surface-base"}`}
            >
              <IconMonitor />
              Desktop
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={preview === "mobile"}
              onClick={() => onPreviewChange("mobile")}
              title="Ver versión mobile"
              className={`flex items-center gap-1 border-l border-text-muted px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.5px] transition-colors ${preview === "mobile" ? "bg-accent-primary text-white" : "bg-white text-text-secondary hover:bg-surface-base"}`}
            >
              <IconSmartphone />
              Mobile
            </button>
          </div>
          {preview === "mobile" && banner.imageUrlMobile && (
            <button
              type="button"
              onClick={() => updateBannerImageMobile(regionId, slotIndex, null)}
              className="text-[10.5px] text-text-tertiary underline"
            >
              Quitar versión mobile
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
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
    </div>
  );
}

function SlotCodeBody({
  regionId,
  slotIndex,
  code,
}: {
  regionId: string;
  slotIndex: number;
  code: CodeBlock;
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
        className="absolute right-8 top-1.5 z-[2] flex h-[26px] w-[26px] items-center justify-center border border-surface-inset bg-white/90 p-0 text-lg leading-none text-text-secondary"
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
      return null;
    case "code":
      return article.snapshot.source === "edm"
        ? <NotaEDMFlexible article={article} />
        : <SecondarySmallArticle article={article} />;
  }
}