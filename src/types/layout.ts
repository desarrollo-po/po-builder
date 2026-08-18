export interface PageLayout {
  id: string;
  slug: string;
  title: string;
  tag_slug: string | null;
  version: number;
  layout: Region[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  meta_description?: string | null;
  og_image_url?: string | null;
}

export type TemplateId =
  | "nota-principal"
  | "tres-notas-principales"
  | "dos-notas-secundarias"
  | "tres-notas-secundarias"
  | "cuatro-notas-secundarias"
  | "dos-notas-sin-foto"
  | "cuatro-notas-sin-foto"
  | "cuadricula"
  | "mas-notas-edm"
  | "edm-horizontal"
  | "banner"
  | "code-region";

export type SlotVariant =
  | "nota-principal"
  | "main-left"
  | "main-right"
  | "secondary-photo"
  | "secondary-small"
  | "secondary-text"
  | "nota-edm"
  | "nota-edm-vertical"
  | "banner"
  | "code";

export interface SlotSpec {
  variant: SlotVariant;
  gridArea: string;
}

export interface TemplateSpec {
  label: string;
  slotsCount: number;
  gridTemplateColumns: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  // When true, null slots don't block publication.
  optionalSlots?: boolean;
  slots: SlotSpec[];
}

export interface Region {
  id: string;
  template: TemplateId;
  order: number;
  blocks: (Block | null)[];
  // ponytail: cuadricula-only banner heights in px. Independent so shrinking
  // one doesn't grow the other. Generalize when a 2nd composite template appears.
  bannerHeights?: [number, number];
  // code-region-only: active column count (1-4). Per-instance config the
  // static TEMPLATE_SPECS entry can't express.
  codeColumns?: number;
}

export interface ArticleBlock {
  type: "article";
  articleId: string;
  snapshot: {
    title: string;
    excerpt: string;
    descripcion?: string;
    descripcionDestacado?: string | null;
    slug: string;
    imageUrl: string | null;
    // WP `mediaDetails.sizes` keyed by name (medium, medium_large, large, full…).
    // Optional: old snapshots in Supabase only have imageUrl.
    imageSizes?: Record<string, string> | null;
    publishedAt: string;
    categoryName: string | null;
    categorySlug: string | null;
    volanta: string | null;
  };
}

export interface BannerBlock {
  type: "banner";
  mediaId?: string;
  imageUrl: string;
  // Optional mobile-specific image. Falls back to `imageUrl` when unset.
  imageUrlMobile?: string;
  linkUrl: string;
  altText: string;
  openInNewTab: boolean;
}

// Raw HTML/iframe embed. Legacy banner-variant slots accept it alongside
// banners (see slotAcceptsBanner); "code"-variant slots (code-region) accept
// it alongside articles and banners — see slotAccepts.
export interface CodeBlock {
  type: "code";
  html: string;
}

export type Block = ArticleBlock | BannerBlock | CodeBlock;

export interface DragItem {
  type: "article" | "banner" | "code";
  articleId?: string;
  snapshot?: ArticleBlock["snapshot"];
  bannerData?: Omit<BannerBlock, "type">;
  html?: string;
}

export const TEMPLATE_SPECS: Record<TemplateId, TemplateSpec> = {
  "nota-principal": {
    label: "Nota principal",
    slotsCount: 1,
    gridTemplateColumns: "1fr",
    slots: [{ variant: "nota-principal", gridArea: "nota-principal" }],
    gridTemplateAreas: `"nota-principal"`,
  },
  "tres-notas-principales": {
    label: "3 notas principales",
    slotsCount: 3,
    gridTemplateColumns: "2fr 1fr",
    gridTemplateAreas: `"main top-right" "main bottom-right"`,
    slots: [
      { variant: "main-left", gridArea: "main" },
      { variant: "main-right", gridArea: "top-right" },
      { variant: "main-right", gridArea: "bottom-right" },
    ],
  },
  "dos-notas-secundarias": {
    label: "2 notas secundarias",
    slotsCount: 2,
    gridTemplateColumns: "1fr 1fr",
    gridTemplateAreas: `"a b"`,
    slots: [
      { variant: "secondary-photo", gridArea: "a" },
      { variant: "secondary-photo", gridArea: "b" },
    ],
  },
  "tres-notas-secundarias": {
    label: "3 notas secundarias",
    slotsCount: 3,
    gridTemplateColumns: "1fr 1fr 1fr",
    gridTemplateAreas: `"a b c"`,
    slots: [
      { variant: "secondary-small", gridArea: "a" },
      { variant: "secondary-small", gridArea: "b" },
      { variant: "secondary-small", gridArea: "c" },
    ],
  },
  "cuatro-notas-secundarias": {
    label: "4 notas secundarias",
    slotsCount: 4,
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gridTemplateAreas: `"a b c d"`,
    slots: [
      { variant: "secondary-small", gridArea: "a" },
      { variant: "secondary-small", gridArea: "b" },
      { variant: "secondary-small", gridArea: "c" },
      { variant: "secondary-small", gridArea: "d" },
    ],
  },
  "dos-notas-sin-foto": {
    label: "2 notas secundarias sin foto",
    slotsCount: 2,
    gridTemplateColumns: "1fr 1fr",
    gridTemplateAreas: `"a b"`,
    slots: [
      { variant: "secondary-text", gridArea: "a" },
      { variant: "secondary-text", gridArea: "b" },
    ],
  },
  "cuatro-notas-sin-foto": {
    label: "4 notas sin foto",
    slotsCount: 4,
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gridTemplateAreas: `"a b c d"`,
    slots: [
      { variant: "secondary-text", gridArea: "a" },
      { variant: "secondary-text", gridArea: "b" },
      { variant: "secondary-text", gridArea: "c" },
      { variant: "secondary-text", gridArea: "d" },
    ],
  },
  cuadricula: {
    label: "Cuadrícula",
    slotsCount: 6,
    gridTemplateColumns: "1fr 1fr 1fr",
    gridTemplateRows: "1fr 1fr",
    gridTemplateAreas: `"a1 a2 b1" "a3 a4 b2"`,
    slots: [
      { variant: "secondary-small", gridArea: "a1" },
      { variant: "secondary-small", gridArea: "a2" },
      { variant: "secondary-small", gridArea: "a3" },
      { variant: "secondary-small", gridArea: "a4" },
      { variant: "banner", gridArea: "b1" },
      { variant: "banner", gridArea: "b2" },
    ],
  },
  "edm-horizontal": {
    label: "EDM Horizontal",
    slotsCount: 5,
    optionalSlots: true,
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateAreas: `"a b c d e"`,
    slots: [
      { variant: "nota-edm-vertical", gridArea: "a" },
      { variant: "nota-edm-vertical", gridArea: "b" },
      { variant: "nota-edm-vertical", gridArea: "c" },
      { variant: "nota-edm-vertical", gridArea: "d" },
      { variant: "nota-edm-vertical", gridArea: "e" },
    ],
  },
  "mas-notas-edm": {
    label: "Más notas EDM",
    slotsCount: 15,
    optionalSlots: true,
    gridTemplateColumns: "1fr 1fr 1fr 1.3fr",
    gridTemplateRows: "repeat(6, minmax(0, 1fr))",
    gridTemplateAreas: `
      "a1 a2 a3 r1"
      "a1 a2 a3 r2"
      "a4 a5 a6 r3"
      "a4 a5 a6 r4"
      "a7 a8 a9 r5"
      "a7 a8 a9 r6"
    `,
    slots: [
      { variant: "secondary-small", gridArea: "a1" },
      { variant: "secondary-small", gridArea: "a2" },
      { variant: "secondary-small", gridArea: "a3" },
      { variant: "secondary-small", gridArea: "a4" },
      { variant: "secondary-small", gridArea: "a5" },
      { variant: "secondary-small", gridArea: "a6" },
      { variant: "secondary-small", gridArea: "a7" },
      { variant: "secondary-small", gridArea: "a8" },
      { variant: "secondary-small", gridArea: "a9" },
      { variant: "nota-edm", gridArea: "r1" },
      { variant: "nota-edm", gridArea: "r2" },
      { variant: "nota-edm", gridArea: "r3" },
      { variant: "nota-edm", gridArea: "r4" },
      { variant: "nota-edm", gridArea: "r5" },
      { variant: "nota-edm", gridArea: "r6" },
    ],
  },
  banner: {
    label: "Banner",
    slotsCount: 1,
    gridTemplateColumns: "1fr",
    gridTemplateAreas: `"banner"`,
    slots: [{ variant: "banner", gridArea: "banner" }],
  },
  // Instance actually renders `Region.codeColumns` (1-4) slots, computed
  // layout in CodeRegionTemplate/CodeRegionRender — this spec exists so
  // slotVariantAt resolves for indices up to 3 regardless of the instance's
  // active column count, and so AddRegionModal's generic preview works.
  "code-region": {
    label: "Bloque flexible: código, notas o banners (1 a 4 columnas)",
    slotsCount: 4,
    optionalSlots: true,
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateAreas: `"a b c d"`,
    slots: [
      { variant: "code", gridArea: "a" },
      { variant: "code", gridArea: "b" },
      { variant: "code", gridArea: "c" },
      { variant: "code", gridArea: "d" },
    ],
  },
};

// Returns the variant a region's slot exposes, used to know which BlockType
// is acceptable in that slot.
export function slotVariantAt(
  template: TemplateId,
  slotIndex: number,
): SlotVariant | null {
  return TEMPLATE_SPECS[template].slots[slotIndex]?.variant ?? null;
}

export function slotAcceptsBanner(variant: SlotVariant): boolean {
  return variant === "banner";
}

// "code" variant marks code-region slots, which accept any block type
// (article, banner, or code) — see slotAccepts.
export function slotAcceptsCode(variant: SlotVariant): boolean {
  return variant === "code";
}

// Single gate for drag-and-drop: does this slot variant accept a block of
// this type? Article-only variants (the default) fall through at the end.
export function slotAccepts(variant: SlotVariant, blockType: Block["type"]): boolean {
  if (slotAcceptsCode(variant)) return true;
  if (slotAcceptsBanner(variant)) return blockType === "banner" || blockType === "code";
  return blockType === "article";
}
