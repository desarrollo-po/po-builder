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
}

export type TemplateId =
  | "nota-principal"
  | "tres-notas-principales"
  | "dos-notas-secundarias"
  | "tres-notas-secundarias"
  | "cuatro-notas-secundarias"
  | "cuatro-notas-sin-foto"
  | "cuadricula"
  | "banner";

export type SlotVariant =
  | "nota-principal"
  | "main-left"
  | "main-right"
  | "secondary-photo"
  | "secondary-small"
  | "secondary-text"
  | "banner";

export interface SlotSpec {
  variant: SlotVariant;
  gridArea: string;
}

export interface TemplateSpec {
  label: string;
  thumbnail: string;
  slotsCount: number;
  gridTemplateColumns: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  slots: SlotSpec[];
}

export interface Region {
  id: string;
  template: TemplateId;
  order: number;
  blocks: (Block | null)[];
  // ponytail: cuadricula-only split (0..1) for the banner column.
  // Generalize when a 2nd composite template appears.
  bannerColumnSplit?: number;
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
    volanta: string | null;
  };
}

export interface BannerBlock {
  type: "banner";
  mediaId?: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  openInNewTab: boolean;
}

export type Block = ArticleBlock | BannerBlock;

export interface DragItem {
  type: "article" | "banner";
  articleId?: string;
  snapshot?: ArticleBlock["snapshot"];
  bannerData?: Omit<BannerBlock, "type">;
}

export const TEMPLATE_SPECS: Record<TemplateId, TemplateSpec> = {
  "nota-principal": {
    label: "Nota principal",
    thumbnail: "/regiones/nota principal.png",
    slotsCount: 1,
    gridTemplateColumns: "1fr",
    slots: [{ variant: "nota-principal", gridArea: "nota-principal" }],
    gridTemplateAreas: `"nota-principal"`,
  },
  "tres-notas-principales": {
    label: "3 notas principales",
    thumbnail: "/regiones/tres-notas-principáles.png",
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
    thumbnail: "/regiones/dos-notas-secundarias.png",
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
    thumbnail: "/regiones/tres-notas-secundarias.png",
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
    thumbnail: "/regiones/4 notas secundarias.png",
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
  "cuatro-notas-sin-foto": {
    label: "4 notas sin foto",
    thumbnail: "/regiones/4 notas sin foto.png",
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
    thumbnail: "/regiones/cuadricula.png",
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
  banner: {
    label: "Banner",
    thumbnail: "/regiones/banner.png",
    slotsCount: 1,
    gridTemplateColumns: "1fr",
    gridTemplateAreas: `"banner"`,
    slots: [{ variant: "banner", gridArea: "banner" }],
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
