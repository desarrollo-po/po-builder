import { useState } from "react";
import { useLayoutStore } from "../../store/layoutStore";
import { TEMPLATE_SPECS, type TemplateId } from "../../types/layout";

const TEMPLATE_ORDER: TemplateId[] = [
  "nota-principal",
  "tres-notas-principales",
  "dos-notas-secundarias",
  "tres-notas-secundarias",
  "cuatro-notas-secundarias",
  "cuatro-notas-sin-foto",
  "banner",
];

export default function AddRegionModal() {
  const { addRegion } = useLayoutStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (template: TemplateId) => {
    addRegion(template);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "9px 16px",
          background: "var(--surface-card)",
          color: "var(--text-secondary)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed var(--border-strong)",
          cursor: "pointer",
          fontWeight: 500,
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 120ms ease-out",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-light)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-card)";
        }}
      >
        <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
        Agregar región
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        style={{
          background: "var(--surface-card)",
          borderRadius: "var(--radius-xl)",
          padding: "24px",
          width: "min(820px, 92vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
              Elegir región
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
              Cada plantilla tiene un layout fijo y una cantidad determinada de notas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "20px",
              color: "var(--text-tertiary)",
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
            title="Cerrar"
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {TEMPLATE_ORDER.map((templateId) => {
            const spec = TEMPLATE_SPECS[templateId];
            return (
              <button
                key={templateId}
                onClick={() => handleAdd(templateId)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  padding: "10px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-card)",
                  cursor: "pointer",
                  gap: "10px",
                  transition: "all 120ms ease-out",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-light)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-card)";
                }}
              >
                <TemplatePreview templateId={templateId} thumbnail={spec.thumbnail} />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {spec.label}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    {spec.slotsCount} slot{spec.slotsCount > 1 ? "s" : ""}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({
  templateId,
  thumbnail,
}: {
  templateId: TemplateId;
  thumbnail: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <CssPreview templateId={templateId} />;
  }

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 7",
        background: "var(--surface-secondary)",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={thumbnail}
        alt=""
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function CssPreview({ templateId }: { templateId: TemplateId }) {
  const spec = TEMPLATE_SPECS[templateId];
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 7",
        padding: "6px",
        background: "var(--surface-secondary)",
        borderRadius: "var(--radius-sm)",
        display: "grid",
        gap: "4px",
        gridTemplateColumns: spec.gridTemplateColumns,
        gridTemplateRows: spec.gridTemplateRows,
        gridTemplateAreas: spec.gridTemplateAreas,
      }}
    >
      {spec.slots.map((slot, i) => (
        <div
          key={i}
          style={{
            gridArea: slot.gridArea,
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}
