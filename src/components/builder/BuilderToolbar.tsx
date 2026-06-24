import { useEffect, useState } from "react";
import { useLayoutStore } from "../../store/layoutStore";

function formatLocalSaveAge(lastLocalSave: string | null, now: number): string | null {
  if (!lastLocalSave) return null;
  const elapsedMs = now - new Date(lastLocalSave).getTime();
  const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000));
  if (elapsedSec < 3) return "Guardado local ahora";
  if (elapsedSec < 60) return `Guardado local hace ${elapsedSec}s`;
  const elapsedMin = Math.floor(elapsedSec / 60);
  if (elapsedMin < 60) return `Guardado local hace ${elapsedMin} min`;
  const elapsedHr = Math.floor(elapsedMin / 60);
  return `Guardado local hace ${elapsedHr}h`;
}

export default function BuilderToolbar() {
  const {
    isDirty,
    save,
    publish,
    undo,
    redo,
    canUndo,
    canRedo,
    layout,
    lastLocalSave,
    draftRestored,
    discardLocalDraft,
  } = useLayoutStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tick once per second so the "hace Xs" indicator stays fresh without
  // re-rendering on every store mutation.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!lastLocalSave) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lastLocalSave]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await save();
    setIsSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Layout guardado" });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: result.error || "Error al guardar" });
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("¿Publicar este layout? Quedará visible de inmediato.")) return;
    setIsPublishing(true);
    const result = await publish();
    setIsPublishing(false);
    if (result.success) {
      setMessage({ type: "success", text: "Layout publicado" });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: result.error || "Error al publicar" });
    }
  };

  const handleDiscardDraft = async () => {
    if (
      !window.confirm(
        "Vas a descartar el borrador local y cargar la última versión guardada en Supabase. ¿Continuar?",
      )
    )
      return;
    setIsDiscarding(true);
    try {
      await discardLocalDraft();
      setMessage({ type: "success", text: "Borrador local descartado" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsDiscarding(false);
    }
  };

  const stateBadge = isDirty
<<<<<<< HEAD
    ? {
      label: "Borrador",
      className: "bg-[#0070f3]/10 text-[#0070f3]",
      dotClassName: "bg-[#0070f3]",
    }
    : layout?.is_published
      ? {
        label: "Publicado",
        className: "bg-emerald-500/10 text-emerald-700",
        dotClassName: "bg-emerald-500",
      }
      : {
        label: "Guardado",
        className: "bg-surface-accent text-text-secondary",
        dotClassName: "bg-gray-400",
      };
=======
    ? { label: "Borrador", bg: "rgba(0,112,243,0.09)", color: "#0070f3", dot: "#0070f3" }
    : layout?.is_published
    ? { label: "Publicado", bg: "rgba(16,185,129,0.09)", color: "#059669", dot: "#10b981" }
    : { label: "Guardado", bg: "var(--surface-secondary)", color: "var(--text-secondary)", dot: "#9ca3af" };
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d

  const localSaveLabel = formatLocalSaveAge(lastLocalSave, now);

  return (
<<<<<<< HEAD
    <div className="flex shrink-0 flex-col">
      <div
        className={`relative z-10 flex h-14 items-center justify-between gap-6 bg-white px-6 ${draftRestored ? "border-b border-amber-300" : "border-b border-surface-inset"
          }`}
      >
        {/* Left: Brand + Title + State */}
        <div className="flex min-w-0 items-center gap-4">
=======
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div
        style={{
          borderBottom: draftRestored ? "1px solid #fcd34d" : "1px solid var(--border)",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          background: "#ffffff",
          boxShadow: "var(--shadow-xs)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Left: Brand + Title + State */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
          {/* Brand mark */}
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
          <img
            src="/favicon-32x32.png"
            alt="Prensa Obrera"
            width={28}
            height={28}
<<<<<<< HEAD
            className="shrink-0 rounded-lg object-contain"
          />

          <div className="flex flex-col gap-px">
            <span className="text-sm font-semibold tracking-[-0.2px] text-black">
              {layout?.slug ?? "Page Builder"}
            </span>
            <span className="text-[11px] font-normal text-text-tertiary">
=======
            style={{
              borderRadius: "var(--radius-lg)",
              flexShrink: 0,
              objectFit: "contain",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#000000", letterSpacing: "-0.2px" }}>
              {layout?.slug ?? "Page Builder"}
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 400 }}>
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
              Home Builder | PrensaObrera.com
            </span>
          </div>

          {/* State badge */}
          <div
<<<<<<< HEAD
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${stateBadge.className}`}
          >
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${stateBadge.dotClassName}`} />
=======
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "99px",
              background: stateBadge.bg,
              color: stateBadge.color,
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: stateBadge.dot,
                flexShrink: 0,
              }}
            />
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
            {stateBadge.label}
          </div>

          {/* Local autosave indicator */}
          {localSaveLabel && (
            <span
              title="Los cambios se guardan automáticamente en tu navegador. Apretá Guardar para subirlos a Supabase."
<<<<<<< HEAD
              className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-text-tertiary"
=======
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-tertiary)",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {localSaveLabel}
            </span>
          )}
        </div>

        {/* Center: transient message */}
        {message && (
          <div
<<<<<<< HEAD
            className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium ${message.type === "success"
                ? "border-surface-inset bg-surface-accent text-text-secondary"
                : "border-[#0070f3]/30 bg-[#0070f3]/10 text-[#0070f3]"
              }`}
          >
            {message.type === "success" ? "✓ " : "⚠ "}
            {message.text}
=======
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "12px",
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: "99px",
              border: `1px solid ${message.type === "success" ? "var(--border)" : "rgba(0,112,243,0.3)"}`,
              background: message.type === "success" ? "var(--surface-secondary)" : "rgba(0,112,243,0.08)",
              color: message.type === "success" ? "var(--text-secondary)" : "#0070f3",
              whiteSpace: "nowrap",
            }}
          >
            {message.type === "success" ? "✓ " : "⚠ "}{message.text}
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
          </div>
        )}

        {/* Right: Controls */}
<<<<<<< HEAD
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex gap-0.5 rounded-lg border border-surface-inset bg-surface-accent p-0.5">
=======
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Undo / Redo */}
          <div
            style={{
              display: "flex",
              gap: "2px",
              padding: "2px",
              background: "var(--surface-secondary)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
            }}
          >
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
            {[
              { fn: undo, can: canUndo, icon: "↶", title: "Deshacer" },
              { fn: redo, can: canRedo, icon: "↷", title: "Rehacer" },
            ].map(({ fn, can, icon, title }) => (
              <button
                key={title}
                onClick={fn}
                disabled={!can()}
                title={title}
<<<<<<< HEAD
                className="flex h-7 w-[30px] items-center justify-center rounded-md border-none bg-transparent p-0 text-[15px] text-text-secondary enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-[0.35]"
=======
                style={{
                  width: "30px",
                  height: "28px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: can() ? 1 : 0.35,
                  cursor: can() ? "pointer" : "not-allowed",
                  border: "none",
                  background: "transparent",
                  borderRadius: "var(--radius-md)",
                  fontSize: "15px",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (can()) (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
              >
                {icon}
              </button>
            ))}
          </div>

<<<<<<< HEAD
          <div className="h-5 w-px bg-surface-inset" />
=======
          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
<<<<<<< HEAD
            className="rounded-lg border border-text-muted bg-white px-3.5 py-[7px] text-[13px] font-medium text-black transition enabled:hover:bg-surface-accent disabled:cursor-not-allowed disabled:opacity-60"
=======
            style={{
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-strong)",
              background: "#ffffff",
              color: "#000000",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
              transition: "all 120ms",
            }}
            onMouseEnter={(e) => {
              if (!isSaving) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-secondary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
            }}
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
          >
            {isSaving ? "Guardando…" : "Guardar"}
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
<<<<<<< HEAD
            className="rounded-lg border border-accent-primary bg-accent-primary px-3.5 py-[7px] text-[13px] font-medium text-white transition enabled:hover:border-accent-hover enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
=======
            className="primary"
            style={{
              padding: "7px 14px",
              fontSize: "13px",
              borderRadius: "var(--radius-lg)",
              cursor: isPublishing ? "not-allowed" : "pointer",
              opacity: isPublishing ? 0.6 : 1,
            }}
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
          >
            {isPublishing ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </div>

      {/* Draft-restored banner */}
      {draftRestored && (
<<<<<<< HEAD
        <div className="flex items-center justify-between gap-4 border-b border-amber-300 bg-amber-500/10 px-6 py-2.5 text-[12.5px] font-medium text-amber-800">
          <span className="flex items-center gap-2">
=======
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "10px 24px",
            background: "rgba(245, 158, 11, 0.10)",
            borderBottom: "1px solid #fcd34d",
            color: "#92400e",
            fontSize: "12.5px",
            fontWeight: 500,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Se restauró un borrador local sin guardar en Supabase.
          </span>
          <button
            onClick={handleDiscardDraft}
            disabled={isDiscarding}
<<<<<<< HEAD
            className="whitespace-nowrap rounded-md border border-amber-300 bg-white px-3 py-[5px] text-xs font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
=======
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "var(--radius-md)",
              border: "1px solid #fcd34d",
              background: "#ffffff",
              color: "#92400e",
              cursor: isDiscarding ? "not-allowed" : "pointer",
              opacity: isDiscarding ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
          >
            {isDiscarding ? "Cargando…" : "Cargar versión guardada"}
          </button>
        </div>
      )}
    </div>
  );
}
