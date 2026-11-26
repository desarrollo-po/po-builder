import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { TEMPLATE_SPECS, TEMPLATE_MOBILE_BREAKPOINT, codeColumnWidthsFor, type ArticleBlock, type Region } from "../../types/layout";
import { edmArticles } from "../../sources/edm-articles";
import BlockRenderer from "./BlockRenderer";
import logoEdm from "../../assets/logo-edm.svg";

interface Props {
  region: Region;
}

const GRID_MOBILE_CLASSES: Record<number, string> = {
  512: "@max-[512px]:grid-cols-1! @max-[512px]:grid-rows-none! @max-[512px]:[grid-template-areas:none]!",
  736: "@max-[736px]:grid-cols-1! @max-[736px]:grid-rows-none! @max-[736px]:[grid-template-areas:none]!",
  700: "@max-[700px]:grid-cols-1! @max-[700px]:grid-rows-none! @max-[700px]:[grid-template-areas:none]!",
};
const DEFAULT_GRID_MOBILE_CLASSES = "@max-md:grid-cols-1! @max-md:grid-rows-none! @max-md:[grid-template-areas:none]!";

const SLOT_MOBILE_CLASSES: Record<number, string> = {
  512: "@max-[512px]:[grid-area:auto]!",
  736: "@max-[736px]:[grid-area:auto]!",
  700: "@max-[700px]:[grid-area:auto]!",
};
const DEFAULT_SLOT_MOBILE_CLASSES = "@max-md:[grid-area:auto]!";

const CODE_REGION_CLASSES: Record<number, { section: string; col: string }> = {
  1: { section: "@md:flex-row @md:items-start", col: "@md:[width:var(--col-width)]" },
  2: { section: "@[512px]:flex-row @[512px]:items-start", col: "@[512px]:[width:var(--col-width)]" },
  3: { section: "@[736px]:flex-row @[736px]:items-start", col: "@[736px]:[width:var(--col-width)]" },
  4: { section: "@[960px]:flex-row @[960px]:items-start", col: "@[960px]:[width:var(--col-width)]" },
};

export default function RegionRenderer({ region }: Props) {
  if (region.template === "cuadricula") {
    return <CuadriculaRender region={region} />;
  }
  if (region.template === "mas-notas-edm") {
    return <MasNotasEdmRender region={region} />;
  }
  if (region.template === "edm-horizontal") {
    return <EdmHorizontalRender region={region} />;
  }
  if (region.template === "edm-carrusel") {
    return <EdmCarruselRender region={region} />;
  }
  if (region.template === "code-region") {
    return <CodeRegionRender region={region} />;
  }

  const spec = TEMPLATE_SPECS[region.template];
  const breakpoint = TEMPLATE_MOBILE_BREAKPOINT[region.template];
  const gridClasses = breakpoint ? GRID_MOBILE_CLASSES[breakpoint] : DEFAULT_GRID_MOBILE_CLASSES;
  const slotClasses = breakpoint ? SLOT_MOBILE_CLASSES[breakpoint] : DEFAULT_SLOT_MOBILE_CLASSES;

  return (
    <section
      data-region-template={region.template}
      className={`grid ${gridClasses}`}
      style={{
        gap: "18px",
        gridTemplateColumns: spec.gridTemplateColumns,
        gridTemplateRows: spec.gridTemplateRows,
        gridTemplateAreas: spec.gridTemplateAreas,
      }}
    >
      {spec.slots.map((slot, slotIndex) => (
        <div
          key={slotIndex}
          className={slotClasses}
          style={{ gridArea: slot.gridArea }}
        >
          <BlockRenderer
            block={region.blocks[slotIndex] ?? null}
            variant={slot.variant}
          />
        </div>
      ))}
    </section>
  );
}

function MasNotasEdmRender({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS["mas-notas-edm"];
  const leftSlots = spec.slots.slice(0, 9);
  const rightSlots = spec.slots.slice(9);
  const [autoBlocks, setAutoBlocks] = useState<ArticleBlock[]>([]);

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

  return (
    <section
      data-region-template={region.template}
      className="flex flex-col gap-[18px] @[736px]:flex-row @[736px]:items-stretch"
    >
      <div
        className="grid flex-[3] gap-[18px] @max-[736px]:grid-cols-1!"
        style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
      >
        {leftSlots.map((slot, i) => (
          <div key={i}>
            <BlockRenderer block={region.blocks[i] ?? null} variant={slot.variant} />
          </div>
        ))}
      </div>

      <div className="flex flex-[1.3] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#19191d] via-[#131316] to-[#0d0d10] p-4 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65)]">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-2 px-1">
          <a
            href="https://revistaedm.com.ar"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-85"
          >
            <img
              src={logoEdm}
              alt="En defensa del marxismo"
              className="h-6 w-auto"
            />
            <span className="border-l border-white/15 pl-3 font-mono text-xs font-light uppercase tracking-[0.22em] text-[#e23b1a]">
              [ÚLTIMOS ARTÍCULOS]
            </span>
          </a>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-2.5">
          {rightSlots.map((slot, i) => {
            const slotIndex = 9 + i;
            const resolvedBlock = region.blocks[slotIndex] ?? autoBlocks[i] ?? null;
            return (
              <div key={slotIndex} className="flex-1">
                <BlockRenderer
                  block={resolvedBlock}
                  variant={slot.variant}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EdmHorizontalRender({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS["edm-horizontal"];

  return (
    <section data-region-template={region.template} className="bg-[#e23b1a]">
      <div className="flex justify-center items-start flex-col bg-white p-3 py-5">
        <img src={logoEdm} alt="EDM" width={155} height={47} className="w-auto h-auto" />
      </div>
      <div
        className="grid gap-4 @max-[1100px]:grid-cols-1! p-4"
        style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
      >
        {spec.slots.map((slot, i) => (
          <div key={i}>
            <BlockRenderer block={region.blocks[i] ?? null} variant={slot.variant} />
          </div>
        ))}
      </div>
    </section>
  );
}

function EdmCarruselRender({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS["edm-carrusel"];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const [autoBlocks, setAutoBlocks] = useState<ArticleBlock[]>([]);

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

  const resolvedBlocks = spec.slots.map(
    (_, i) => region.blocks[i] ?? autoBlocks[i] ?? null,
  );

  const scrollLeftEdm = () => {
    carouselRef.current?.scrollBy({ left: -270, behavior: "smooth" });
  };

  const scrollRightEdm = () => {
    carouselRef.current?.scrollBy({ left: 270, behavior: "smooth" });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const slider = carouselRef.current;
    if (!slider) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - slider.offsetLeft,
      scrollLeft: slider.scrollLeft,
    };
    setIsDragging(true);
  };

  const handleMouseLeaveOrUp = () => {
    dragState.current.isDown = false;
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const slider = carouselRef.current;
    if (!dragState.current.isDown || !slider) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5;
    slider.scrollLeft = dragState.current.scrollLeft - walk;
  };

  return (
    <section
      data-region-template={region.template}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#19191d] via-[#131316] to-[#0d0d10] pt-4 pb-4 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65)]"
    >
      {/* Cabecera con logo, [ÚLTIMOS ARTÍCULOS] y flechas arriba a la derecha */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-5">
        <a
          href="https://revistaedm.com.ar"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 transition-opacity hover:opacity-85"
        >
          <img
            src={logoEdm}
            alt="En defensa del marxismo"
            className="h-6 w-auto"
          />
          <span className="border-l border-white/15 pl-3 font-mono text-xs font-light uppercase tracking-[0.22em] text-[#e23b1a]">
            [ÚLTIMOS ARTÍCULOS]
          </span>
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollLeftEdm}
            aria-label="Anterior artículo EDM"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#e23b1a] text-lg leading-none text-white shadow-[0_0_16px_rgba(226,59,26,0.65)] backdrop-blur-md transition-all hover:scale-105 hover:bg-[#ff4621] hover:shadow-[0_0_24px_rgba(255,70,33,0.9)]"
          >
            &#8249;
          </button>
          <button
            type="button"
            onClick={scrollRightEdm}
            aria-label="Siguiente artículo EDM"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#e23b1a] text-lg leading-none text-white shadow-[0_0_16px_rgba(226,59,26,0.65)] backdrop-blur-md transition-all hover:scale-105 hover:bg-[#ff4621] hover:shadow-[0_0_24px_rgba(255,70,33,0.9)]"
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Pista del carrusel */}
      <div
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-4 overflow-x-auto px-5 pb-2 scroll-smooth select-none [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:mx-5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#e23b1a]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#ff4621]/80 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {spec.slots.map((slot, i) => (
          <div
            key={i}
            className="min-w-[240px] max-w-[260px] shrink-0 overflow-hidden rounded-xl transition-transform duration-200 hover:-translate-y-0.5"
          >
            <BlockRenderer block={resolvedBlocks[i]} variant={slot.variant} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CodeRegionRender({ region }: { region: Region }) {
  const columns = region.codeColumns ?? 1;
  const weights = codeColumnWidthsFor(region);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const gapTotal = (columns - 1) * 18;
  const classes = CODE_REGION_CLASSES[columns] ?? CODE_REGION_CLASSES[1];

  return (
    <section
      data-region-template="code-region"
      className={`flex flex-col ${classes.section}`}
      style={{ gap: "18px" }}
    >
      {Array.from({ length: columns }, (_, i) => (
        <div
          key={i}
          className={`w-full ${classes.col}`}
          style={{ "--col-width": `calc((100% - ${gapTotal}px) * ${weights[i] / totalWeight})` } as CSSProperties}
        >
          <BlockRenderer block={region.blocks[i] ?? null} variant="code" />
        </div>
      ))}
    </section>
  );
}

function CuadriculaRender({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS.cuadricula;
  const heights = region.bannerHeights ?? [200, 200];
  const articleSlots = spec.slots.slice(0, 4);
  const bannerSlots = spec.slots.slice(4, 6);

  return (
    <section
      data-region-template={region.template}
      className="flex flex-col gap-[18px] @[512px]:flex-row @[512px]:items-stretch"
    >
      <div
        className="grid flex-[2] gap-[18px] @max-[512px]:grid-cols-1!"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
        }}
      >
        {articleSlots.map((slot, i) => (
          <div key={i}>
            <BlockRenderer block={region.blocks[i] ?? null} variant={slot.variant} />
          </div>
        ))}
      </div>

      <div className="flex flex-[1] flex-col gap-[18px]">
        <div className="overflow-hidden" style={{ height: heights[0] }}>
          <BlockRenderer block={region.blocks[4] ?? null} variant={bannerSlots[0].variant} />
        </div>
        <div className="overflow-hidden" style={{ height: heights[1] }}>
          <BlockRenderer block={region.blocks[5] ?? null} variant={bannerSlots[1].variant} />
        </div>
      </div>
    </section>
  );
}