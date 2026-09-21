import type { CSSProperties } from "react";
import { TEMPLATE_SPECS, TEMPLATE_MOBILE_BREAKPOINT, codeColumnWidthsFor, type Region } from "../../types/layout";
import BlockRenderer from "./BlockRenderer";
import logoEdm from "../../assets/logo-edm.png";

interface Props {
  region: Region;
}

// Tailwind needs each full class name literally in the source to generate
// its CSS, so a per-template pixel value (TEMPLATE_MOBILE_BREAKPOINT) can't
// be interpolated into an arbitrary-value variant — instead every value that
// constant actually uses gets a literal entry here.
const GRID_MOBILE_CLASSES: Record<number, string> = {
  512: "@max-[512px]:grid-cols-1! @max-[512px]:grid-rows-none! @max-[512px]:[grid-template-areas:none]!",
  736: "@max-[736px]:grid-cols-1! @max-[736px]:grid-rows-none! @max-[736px]:[grid-template-areas:none]!",
  960: "@max-[960px]:grid-cols-1! @max-[960px]:grid-rows-none! @max-[960px]:[grid-template-areas:none]!",
};
const DEFAULT_GRID_MOBILE_CLASSES = "@max-md:grid-cols-1! @max-md:grid-rows-none! @max-md:[grid-template-areas:none]!";

const SLOT_MOBILE_CLASSES: Record<number, string> = {
  512: "@max-[512px]:[grid-area:auto]!",
  736: "@max-[736px]:[grid-area:auto]!",
  960: "@max-[960px]:[grid-area:auto]!",
};
const DEFAULT_SLOT_MOBILE_CLASSES = "@max-md:[grid-area:auto]!";

// code-region's column count is a runtime choice (1-4), so unlike every
// other template it can't have one fixed entry in TEMPLATE_MOBILE_BREAKPOINT
// — the breakpoint is picked per-render from the region's actual codeColumns.
const CODE_REGION_CLASSES: Record<number, { section: string; col: string }> = {
  1: { section: "@md:flex-row @md:items-start", col: "@md:[width:var(--col-width)]" },
  2: { section: "@[512px]:flex-row @[512px]:items-start", col: "@[512px]:[width:var(--col-width)]" },
  3: { section: "@[736px]:flex-row @[736px]:items-start", col: "@[736px]:[width:var(--col-width)]" },
  4: { section: "@[960px]:flex-row @[960px]:items-start", col: "@[960px]:[width:var(--col-width)]" },
};

// A region is just a CSS grid declared by its template, plus N slots that
// each delegate to BlockRenderer. The renderer has no opinion about whether
// a slot is full or empty — the BlockRenderer handles that by returning
// null on missing blocks (so the layout stays empty rather than showing a
// dashed placeholder, which is a builder-only concern).
export default function RegionRenderer({ region }: Props) {
  // ponytail: composite layouts handled inline. Mirror of the builder's
  // RegionTemplate branches. Generalize when a 4th composite template appears.
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
