// Section color palette mirroring the production stylesheet's CSS custom
// properties. Used as a runtime lookup for inline styles in the builder
// preview and the sidebar article list.

export const SECTION_COLORS: Record<string, string> = {
  aniversarios: "#333333",
  politicas: "#e64a19",
  mujer: "#8bc34a",
  ambiente: "#587c2f",
  internacionales: "#880e4f",
  juventud: "#512da8",
  sindicales: "#ff9800",
  historia: "#ffee33",
  rojoprensa: "#f44336",
  cultura: "#1976d2",
  educacion: "#e72679",
  "movimiento-piquetero": "#000000",
  "libertades-democraticas": "#00796b",
  opinion: "#666666",
  partido: "#cf141c",
  "partido-obrero": "#cf141c",
  sociedad: "#308090",
};

export const DEFAULT_SECTION_COLOR = "#666666";

const COMBINING_MARKS = /[̀-ͯ]/g;

// Normalizes a category display name to its slug. Strips accents, lowercases,
// and replaces whitespace with hyphens so "Movimiento Piquetero" matches
// "movimiento-piquetero". Non-alphanumeric characters (other than hyphens)
// are stripped.
export function sectionSlug(name: string | null | undefined): string | null {
  if (!name) return null;
  const slug = name
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return slug || null;
}

export function getSectionColor(
  name: string | null | undefined,
  fallback: string = DEFAULT_SECTION_COLOR,
): string {
  const slug = sectionSlug(name);
  if (!slug) return fallback;
  return SECTION_COLORS[slug] ?? fallback;
}
