import { useTapPlaceStore } from "../../store/tapPlaceStore";

export default function ArmedContentBar() {
  const armed = useTapPlaceStore((s) => s.armed);
  const disarm = useTapPlaceStore((s) => s.disarm);

  if (!armed) return null;

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-accent-primary/30 bg-accent-light px-4 py-2 text-[12.5px] font-medium text-text-primary">
      <span className="min-w-0 truncate">
        Colocando: <span className="font-semibold">{armed.label}</span> — tocá un slot para insertarlo
      </span>
      <button
        onClick={disarm}
        className="shrink-0 whitespace-nowrap rounded-md border border-surface-inset bg-white px-2.5 py-1 text-xs font-semibold text-text-secondary"
      >
        Cancelar
      </button>
    </div>
  );
}
