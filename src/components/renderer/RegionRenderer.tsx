import { TEMPLATE_SPECS, type Region } from "../../types/layout";
import BlockRenderer from "./BlockRenderer";
import logoEdm from "../../assets/logo-edm.png";

interface Props {
  region: Region;
}

// A region is just a CSS grid declared by its template, plus N slots that
// each delegate to BlockRenderer. The renderer has no opinion about whether
// a slot is full or empty — the BlockRenderer handles that by returning
// null on missing blocks (so the layout stays empty rather than showing a
// dashed placeholder, which is a builder-only concern).
export default function RegionRenderer({ region }: Props) {
  // ponytail: composite layouts handled inline. Mirror of the builder's
  // RegionTemplate branches. Generalize when a 3rd composite template appears.
  if (region.template === "cuadricula") {
    return <CuadriculaRender region={region} />;
  }
  if (region.template === "mas-notas-edm") {
    return <MasNotasEdmRender region={region} />;
  }

  const spec = TEMPLATE_SPECS[region.template];

  return (
    <section
      data-region-template={region.template}
      className="grid @max-md:grid-cols-1! @max-md:grid-rows-none! @max-md:[grid-template-areas:none]!"
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
          className="@max-md:[grid-area:auto]!"
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
  const rightSlots = spec.slots.slice(9, 15);

  return (
    <section
      data-region-template={region.template}
      className="flex flex-col gap-[18px] @md:flex-row @md:items-stretch"
    >
      <div
        className="grid flex-[3] gap-[18px] @max-md:grid-cols-1!"
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
        <div className="flex flex-[1.3] flex-col gap-3 bg-red-600 p-3">
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

function CuadriculaRender({ region }: { region: Region }) {
  const spec = TEMPLATE_SPECS.cuadricula;
  const ratio = region.bannerColumnSplit ?? 0.5;
  const articleSlots = spec.slots.slice(0, 4);
  const bannerSlots = spec.slots.slice(4, 6);

  return (
    <section
      data-region-template={region.template}
      className="flex flex-col gap-[18px] @md:flex-row @md:items-stretch"
    >
      <div
        className="grid flex-[2] gap-[18px] @max-md:grid-cols-1!"
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
        <div
          className="overflow-hidden @md:min-h-0"
          style={{ flexGrow: ratio, flexShrink: 1, flexBasis: 0 }}
        >
          <BlockRenderer block={region.blocks[4] ?? null} variant={bannerSlots[0].variant} />
        </div>
        <div
          className="overflow-hidden @md:min-h-0"
          style={{ flexGrow: 1 - ratio, flexShrink: 1, flexBasis: 0 }}
        >
          <BlockRenderer block={region.blocks[5] ?? null} variant={bannerSlots[1].variant} />
        </div>
      </div>
    </section>
  );
}
