import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayoutStore } from "../../store/layoutStore";
import { useAuthStore } from "../../store/authStore";
import { signOutAll } from "../../lib/supabase";

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
  const email = useAuthStore((s) => s.email);
  const navigate = useNavigate();
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

  const localSaveLabel = formatLocalSaveAge(lastLocalSave, now);

  return (
    <div className="flex shrink-0 flex-col">
      <div
        className={`relative z-10 flex h-14 items-center justify-between gap-6 bg-white px-6 ${draftRestored ? "border-b border-amber-300" : "border-b border-surface-inset"
          }`}
      >
        {/* Left: Brand + Title + State */}
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={() => navigate("/")}
            title="Volver a páginas"
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-surface-inset bg-white px-2 py-[5px] text-[11px] font-medium text-text-secondary hover:bg-surface-accent"
          >
            ← Páginas
          </button>

          <img
            src={`${import.meta.env.BASE_URL}favicon-32x32.png`}
            alt="Prensa Obrera"
            width={28}
            height={28}
            className="shrink-0 rounded-lg object-contain"
          />

          <div className="flex flex-col gap-px">
            <span className="text-sm font-semibold tracking-[-0.2px] text-black">
              {layout?.title || layout?.slug || "Page Builder"}
            </span>
            <span className="text-[11px] font-normal text-text-tertiary">
              /{layout?.slug ?? ""}
              {layout?.tag_slug ? ` · tag: ${layout.tag_slug}` : ""}
            </span>
          </div>

          {/* State badge */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${stateBadge.className}`}
          >
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${stateBadge.dotClassName}`} />
            {stateBadge.label}
          </div>

          {/* Local autosave indicator */}
          {localSaveLabel && (
            <span
              title="Los cambios se guardan automáticamente en tu navegador. Apretá Guardar para subirlos a Supabase."
              className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-text-tertiary"
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
            className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium ${message.type === "success"
              ? "border-surface-inset bg-surface-accent text-text-secondary"
              : "border-[#0070f3]/30 bg-[#0070f3]/10 text-[#0070f3]"
              }`}
          >
            {message.type === "success" ? "✓ " : "⚠ "}
            {message.text}
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex gap-0.5 rounded-lg border border-surface-inset bg-surface-accent p-0.5">
            {[
              { fn: undo, can: canUndo, icon: "↶", title: "Deshacer" },
              { fn: redo, can: canRedo, icon: "↷", title: "Rehacer" },
            ].map(({ fn, can, icon, title }) => (
              <button
                key={title}
                onClick={fn}
                disabled={!can()}
                title={title}
                className="flex h-7 w-[30px] items-center justify-center rounded-md border-none bg-transparent p-0 text-[15px] text-text-secondary enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-[0.35]"
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-surface-inset" />

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg border border-text-muted bg-white px-3.5 py-[7px] text-[13px] font-medium text-black transition enabled:hover:bg-surface-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Guardando…" : "Guardar"}
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="rounded-lg border border-button-publish-hover bg-button-publish px-3.5 py-[7px] text-[13px] font-medium text-white transition enabled:hover:border-button-publish-hover enabled:hover:bg-button-publish-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPublishing ? "Publicando…" : "Publicar"}
          </button>

          <div className="h-5 w-px bg-surface-inset" />

          {/* User + Logout */}
          {email && (
            <div className="flex items-center gap-2">
              <span
                title={email}
                className="max-w-[180px] truncate text-[11px] font-medium text-text-tertiary"
              >
                {email}
              </span>
              <button
                onClick={() => signOutAll()}
                title="Cerrar sesión"
                className="rounded-md border border-surface-inset bg-white px-2.5 py-[5px] text-[11px] font-medium text-text-secondary hover:bg-surface-accent"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Draft-restored banner */}
      {draftRestored && (
        <div className="flex items-center justify-between gap-4 border-b border-amber-300 bg-amber-500/10 px-6 py-2.5 text-[12.5px] font-medium text-amber-800">
          <span className="flex items-center gap-2">
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
            className="whitespace-nowrap rounded-md border border-amber-300 bg-white px-3 py-[5px] text-xs font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDiscarding ? "Cargando…" : "Cargar versión guardada"}
          </button>
        </div>
      )}
    </div>
  );
}
