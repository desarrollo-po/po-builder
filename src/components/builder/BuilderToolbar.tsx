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
    ? { label: "Borrador", bg: "rgba(0,112,243,0.09)", color: "#0070f3", dot: "#0070f3" }
    : layout?.is_published
    ? { label: "Publicado", bg: "rgba(16,185,129,0.09)", color: "#059669", dot: "#10b981" }
    : { label: "Guardado", bg: "var(--surface-secondary)", color: "var(--text-secondary)", dot: "#9ca3af" };

  const localSaveLabel = formatLocalSaveAge(lastLocalSave, now);

  return (
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
          <img
            src="/favicon-32x32.png"
            alt="Prensa Obrera"
            width={28}
            height={28}
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
              Home Builder | PrensaObrera.com
            </span>
          </div>

          {/* State badge */}
          <div
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
            {stateBadge.label}
          </div>

          {/* Local autosave indicator */}
          {localSaveLabel && (
            <span
              title="Los cambios se guardan automáticamente en tu navegador. Apretá Guardar para subirlos a Supabase."
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-tertiary)",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
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
          </div>
        )}

        {/* Right: Controls */}
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
            {[
              { fn: undo, can: canUndo, icon: "↶", title: "Deshacer" },
              { fn: redo, can: canRedo, icon: "↷", title: "Rehacer" },
            ].map(({ fn, can, icon, title }) => (
              <button
                key={title}
                onClick={fn}
                disabled={!can()}
                title={title}
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
              >
                {icon}
              </button>
            ))}
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
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
          >
            {isSaving ? "Guardando…" : "Guardar"}
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="primary"
            style={{
              padding: "7px 14px",
              fontSize: "13px",
              borderRadius: "var(--radius-lg)",
              cursor: isPublishing ? "not-allowed" : "pointer",
              opacity: isPublishing ? 0.6 : 1,
            }}
          >
            {isPublishing ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </div>

      {/* Draft-restored banner */}
      {draftRestored && (
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
          >
            {isDiscarding ? "Cargando…" : "Cargar versión guardada"}
          </button>
        </div>
      )}
    </div>
  );
}
