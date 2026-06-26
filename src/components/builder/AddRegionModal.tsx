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
  "cuadricula",
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
        className="w-full justify-center flex items-center gap-1.5 rounded-md border border-dashed border-text-muted bg-white px-4 py-[9px] text-[13px] font-medium text-text-secondary transition hover:border-accent-primary hover:bg-accent-light hover:text-accent-primary"
      >
        <span className="text-base leading-none">+</span>
        Agregar región
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="max-h-[90vh] w-[min(820px,92vw)] overflow-y-auto rounded-xl border border-surface-inset bg-white p-6 shadow-lg">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="mb-1 text-[18px] font-semibold text-text-primary">
              Elegir región
            </h2>
            <p className="m-0 text-[13px] text-text-secondary">
              Cada plantilla tiene un layout fijo y una cantidad determinada de notas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            title="Cerrar"
            className="border-none bg-transparent px-1 text-xl leading-none text-text-tertiary hover:text-text-primary"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {TEMPLATE_ORDER.map((templateId) => {
            const spec = TEMPLATE_SPECS[templateId];
            return (
              <button
                key={templateId}
                onClick={() => handleAdd(templateId)}
                className="flex flex-col gap-2.5 rounded-md border border-surface-inset bg-white p-2.5 text-left transition hover:border-accent-primary hover:bg-accent-light"
              >
                <TemplatePreview templateId={templateId} thumbnail={spec.thumbnail} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold text-text-primary">
                    {spec.label}
                  </span>
                  <span className="text-[11px] text-text-tertiary">
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
    <div className="flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-sm bg-surface-accent">
      <img
        src={thumbnail}
        alt=""
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function CssPreview({ templateId }: { templateId: TemplateId }) {
  const spec = TEMPLATE_SPECS[templateId];
  return (
    <div
      className="grid aspect-[16/7] w-full gap-1 rounded-sm bg-surface-accent p-1.5"
      style={{
        gridTemplateColumns: spec.gridTemplateColumns,
        gridTemplateRows: spec.gridTemplateRows,
        gridTemplateAreas: spec.gridTemplateAreas,
      }}
    >
      {spec.slots.map((slot, i) => (
        <div
          key={i}
          className="rounded-[2px] border border-surface-inset bg-white"
          style={{ gridArea: slot.gridArea }}
        />
      ))}
    </div>
  );
}
