import { TEMPLATE_SPECS, type Region } from "../../types/layout";
import BlockRenderer from "./BlockRenderer";

interface Props {
  region: Region;
}

// A region is just a CSS grid declared by its template, plus N slots that
// each delegate to BlockRenderer. The renderer has no opinion about whether
// a slot is full or empty — the BlockRenderer handles that by returning
// null on missing blocks (so the layout stays empty rather than showing a
// dashed placeholder, which is a builder-only concern).
export default function RegionRenderer({ region }: Props) {
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
