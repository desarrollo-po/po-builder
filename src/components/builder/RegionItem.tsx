import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLayoutStore } from "../../store/layoutStore";
import { TEMPLATE_SPECS, type Region } from "../../types/layout";
import RegionTemplate from "./RegionTemplate";

interface Props {
  region: Region;
}

export default function RegionItem({ region }: Props) {
  const { deleteRegion } = useLayoutStore();
  const spec = TEMPLATE_SPECS[region.template];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: region.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const emptySlots = region.blocks.filter(
    (b) =>
      b === null ||
      (b.type === "banner" && !b.linkUrl.trim()),
  ).length;
  const optionalSlots = !!spec.optionalSlots;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: "var(--surface-base)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: "grab",
              flexShrink: 0,
              padding: "2px",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-tertiary)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
          </div>

          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "5px 6px",
            }}
          >
            {spec.label}
          </span>

          {emptySlots > 0 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: optionalSlots ? "#6b7280" : "#b45309",
                background: optionalSlots ? "rgba(107,114,128,0.1)" : "rgba(245, 158, 11, 0.12)",
                padding: "3px 8px",
                borderRadius: "99px",
                flexShrink: 0,
                letterSpacing: "0.1px",
              }}
              title={
                optionalSlots
                  ? "Slots sin nota — se publicará dejando estos slots vacíos"
                  : "Slots sin nota — el publicar quedará bloqueado hasta completarlos"
              }
            >
              {emptySlots} slot{emptySlots > 1 ? "s" : ""} vacío{emptySlots > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <button
          onClick={() => deleteRegion(region.id)}
          style={{
            color: "var(--text-tertiary)",
            fontSize: "14px",
            fontWeight: 500,
            padding: "5px 8px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            transition: "all 120ms ease-out",
            lineHeight: 1,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-light)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)";
          }}
          title="Eliminar región"
        >
          ✕
        </button>
      </div>

      <div className="@container" style={{ padding: "12px" }}>
        <RegionTemplate region={region} />
      </div>
    </div>
  );
}
