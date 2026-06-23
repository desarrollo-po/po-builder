import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Region } from "../../types/layout";
import RegionItem from "./RegionItem";

interface Props {
  regions: Region[];
}

export default function RegionList({ regions }: Props) {
  const regionIds = regions.map((r) => r.id);

  return (
    <SortableContext items={regionIds} strategy={verticalListSortingStrategy}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {regions.map((region) => (
          <RegionItem key={region.id} region={region} />
        ))}
        {regions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              paddingTop: "48px",
              paddingBottom: "48px",
              border: "2px dashed var(--border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <p style={{ color: "var(--text-tertiary)" }}>No regions yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </SortableContext>
  );
}
