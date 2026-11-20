import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TEMPLATE_SPECS, TEMPLATE_MOBILE_BREAKPOINT, codeColumnWidthsFor, type Region } from "../../types/layout";
import BlockRenderer from "./BlockRenderer";
import YoutubeCarouselSection from "./YoutubeCarouselSection";
import logoEdm from "../../assets/logo-edm.png";

interface Props {
  region: Region;
}

const GRID_MOBILE_CLASSES: Record<number, string> = {
  512: "@max-[512px]:grid-cols-1! @max-[512px]:grid-rows-none! @max-[512px]:[grid-template-areas:none]!",
  736: "@max-[736px]:grid-cols-1! @max-[736px]:grid-rows-none! @max-[736px]:[grid-template-areas:none]!",
  700: "@max-[700px]:grid-cols-1! @max-[700px]:grid-rows-none! @max-[700px]:[grid-template-areas:none]!",
  900: "@max-[900px]:grid-cols-1! @max-[900px]:grid-rows-none! @max-[900px]:[grid-template-areas:none]!",
};
const DEFAULT_GRID_MOBILE_CLASSES = "@max-md:grid-cols-1! @max-md:grid-rows-none! @max-md:[grid-template-areas:none]!";

const SLOT_MOBILE_CLASSES: Record<number, string> = {
  512: "@max-[512px]:[grid-area:auto]!",
  736: "@max-[736px]:[grid-area:auto]!",
  700: "@max-[700px]:[grid-area:auto]!",
  900: "@max-[900px]:[grid-area:auto]!",
};
const DEFAULT_SLOT_MOBILE_CLASSES = "@max-md:[grid-area:auto]!";

const CODE_REGION_CLASSES: Record<number, { section: string; col: string }> = {
  1: { section: "@md:flex-row @md:items-stretch", col: "@md:[width:var(--col-width)]" },
  2: { section: "@[512px]:flex-row @[512px]:items-stretch", col: "@[512px]:[width:var(--col-width)]" },
  3: { section: "@[736px]:flex-row @[736px]:items-stretch", col: "@[736px]:[width:var(--col-width)]" },
  4: { section: "@[960px]:flex-row @[960px]:items-stretch", col: "@[960px]:[width:var(--col-width)]" },
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
  if (region.template === "code-region") {
    return <CodeRegionRender region={region} />;
  }
  if (region.template === "multimedia-youtube") {
    return <YoutubeCarouselSection blocks={region.blocks} />;
  }
  if (region.template === "multimedia-reels") {
    return <InstagramReelsRender region={region} />;
  }
  if (region.template === "video-destacado") {
    return <VideoDestacadoRender region={region} />;
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

function VideoDestacadoRender({ region }: { region: Region }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const [targetHeight, setTargetHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;

    const update = () => {
      if (window.innerWidth >= 736) {
        setTargetHeight(el.offsetHeight || null);
      } else {
        setTargetHeight(null);
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const rightBlock = region.blocks[1] ?? null;
  const isRightArticle = rightBlock?.type === "article";
  const isRightEdmArticle =
    rightBlock?.type === "article" && rightBlock.snapshot.source === "edm";
  const autoplay = region.autoplay ?? true;

  const rightCardLayoutClass = isRightEdmArticle
    ? "[&>div]:h-full"
    : isRightArticle
      ? "[&>article]:flex [&>article]:h-full [&>article]:flex-col [&>article]:gap-2.5 [&_a:has(img)]:min-h-0 [&_a:has(img)]:flex-1 [&_a:has(img)]:overflow-hidden [&_img]:h-full [&_img]:max-h-none [&_img]:w-full [&_img]:object-cover"
      : "[&>div]:h-full [&>button]:flex [&>button]:h-full [&>button]:w-full [&>button]:flex-col [&>button>div:first-child]:flex [&>button>div:first-child]:w-full [&>button>div:first-child]:shrink-0 [&>button>div:first-child]:flex-row [&>button>div:first-child]:items-center [&>button>div:first-child]:justify-between [&>button>div:last-child]:min-h-0 [&>button>div:last-child]:w-full [&>button>div:last-child]:flex-1 [&_img]:h-full [&_img]:w-full [&_img]:object-cover";

  return (
    <section
      data-region-template="video-destacado"
      className="grid grid-cols-1 items-start gap-[18px] @[736px]:grid-cols-[1.4fr_1fr]"
    >
      <div ref={leftRef} className="min-w-0">
        <BlockRenderer
          block={region.blocks[0] ?? null}
          variant="video-destacado-primary"
          autoplay={autoplay}
        />
      </div>

      <div
        style={targetHeight ? { height: `${targetHeight}px` } : undefined}
        className={`min-w-0 overflow-hidden ${rightCardLayoutClass}`}
      >
        <BlockRenderer
          block={rightBlock}
          variant="video-destacado-secondary"
        />
      </div>
    </section>
  );
}

function InstagramReelsRender({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS["multimedia-reels"];
  const hasAny = region.blocks.some((b) => b !== null);
  if (!hasAny) return null;

  return (
    <section data-region-template={region.template} className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-neutral-900">
          Reels · @prensaobrera
        </h2>
        <a
          href="https://www.instagram.com/prensaobrera/reels/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#9C0015] hover:underline"
        >
          Ver más en Instagram →
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {spec.slots.map((slot, slotIndex) => (
          <div key={slotIndex}>
            <BlockRenderer
              block={region.blocks[slotIndex] ?? null}
              variant={slot.variant}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function MasNotasEdmRender({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS["mas-notas-edm"];
  const leftSlots = spec.slots.slice(0, 9);
  const rightSlots = spec.slots.slice(9);

  return (
    <section
      data-region-template={region.template}
      className="flex flex-col gap-[18px] @[736px]:flex-row @[736px]:items-start"
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
      <div className="flex flex-[1.3] flex-col">
        <div className="flex justify-center items-start flex-col bg-white p-3 py-5">
          <img src={logoEdm} alt="EDM" width={155} height={47} className="w-auto h-auto" />
        </div>
        <div className="flex flex-[1.3] flex-col gap-3 bg-[#e23b1a] p-3">
          {rightSlots.map((slot, i) => {
            const slotIndex = 9 + i;
            return (
              <div key={slotIndex}>
                <BlockRenderer
                  block={region.blocks[slotIndex] ?? null}
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

function CodeRegionRender({ region }: { region: Region }) {
  const columns = region.codeColumns ?? 1;
  const weights = codeColumnWidthsFor(region);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const gapTotal = (columns - 1) * 18;
  const classes = CODE_REGION_CLASSES[columns] ?? CODE_REGION_CLASSES[1];

  return (
    <section
      data-region-template="code-region"
      className={`flex flex-col items-stretch ${classes.section}`}
      style={{ gap: "18px" }}
    >
      {Array.from({ length: columns }, (_, i) => (
        <div
          key={i}
          className={`flex w-full flex-col [&>div]:flex-1 ${classes.col}`}
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