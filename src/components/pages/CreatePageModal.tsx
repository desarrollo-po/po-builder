import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPage } from "../../lib/supabase";

interface Props {
  existingSlugs: string[];
  onClose: () => void;
  onCreated: () => void;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function CreatePageModal({ existingSlugs, onClose, onCreated }: Props) {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!slug.trim()) return "El slug es obligatorio.";
    if (!SLUG_RE.test(slug)) return "Slug inválido: usá minúsculas, números y guiones (kebab-case).";
    if (existingSlugs.includes(slug)) return `Ya existe una página con slug "${slug}".`;
    if (!title.trim()) return "El título es obligatorio.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await createPage({
      slug: slug.trim(),
      title: title.trim(),
      tag_slug: tagSlug.trim() || null,
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || "Error al crear la página.");
      return;
    }
    onCreated();
    navigate(`/edit/${slug.trim()}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-[min(480px,92vw)] overflow-y-auto rounded-xl border border-surface-inset bg-white p-6 shadow-lg"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="mb-1 text-[18px] font-semibold text-text-primary">
              Crear nueva página
            </h2>
            <p className="m-0 text-[13px] text-text-secondary">
              El slug será la URL en el sitio público (<code>/[slug]</code>).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="border-none bg-transparent px-1 text-xl leading-none text-text-tertiary hover:text-text-primary"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-text-secondary">Slug</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="paro-general"
              autoFocus
              className="rounded-md border border-surface-inset bg-white px-3 py-2 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary/60 focus:border-accent-primary"
            />
            <span className="text-[11px] text-text-tertiary">
              Minúsculas, números y guiones. Ej: <code>paro-general</code>.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-text-secondary">Título</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paro General 2026"
              className="rounded-md border border-surface-inset bg-white px-3 py-2 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary/60 focus:border-accent-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-text-secondary">
              Filtrar por tag
            </span>
            <input
              type="text"
              value={tagSlug}
              onChange={(e) => setTagSlug(e.target.value)}
              placeholder="paro-general"
              className="rounded-md border border-surface-inset bg-white px-3 py-2 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary/60 focus:border-accent-primary"
            />
            <span className="text-[11px] text-text-tertiary">
              Si lo seteás, te aparecerán sólo las notas de ese tag.
            </span>
          </label>

          {error && (
            <div className="rounded-md border border-[#0070f3]/30 bg-[#0070f3]/10 px-3 py-2 text-[12.5px] font-medium text-[#0070f3]">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-surface-inset bg-white px-3.5 py-[7px] text-[13px] font-medium text-text-secondary hover:bg-surface-accent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg border border-accent-primary bg-accent-primary px-3.5 py-[7px] text-[13px] font-medium text-white transition enabled:hover:border-accent-hover enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creando…" : "Crear página"}
          </button>
        </div>
      </form>
    </div>
  );
}
