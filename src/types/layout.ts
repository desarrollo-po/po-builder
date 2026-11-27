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
  | "edm-carrusel"
  | "banner"
  | "code-region"
  | "multimedia-reels"
  | "multimedia-youtube"
  | "video-destacado";

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
  | "code"
  | "multimedia-reel"
  | "multimedia-youtube"
  | "video-destacado-primary"
  | "video-destacado-secondary";

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
  optionalSlots?: boolean;
  slots: SlotSpec[];
}

export interface Region {
  id: string;
  template: TemplateId;
  order: number;
  blocks: (Block | null)[];
  bannerHeights?: [number, number];
  codeColumns?: number;
  codeColumnWidths?: number[];
  autoplay?: boolean;
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
    imageSizes?: Record<string, string> | null;
    publishedAt: string;
    categoryName: string | null;
    categorySlug: string | null;
    volanta: string | null;
    author?: string | null;
    source?: "po" | "edm";
  };
}

export interface BannerBlock {
  type: "banner";
  mediaId?: string;
  imageUrl: string;
  imageUrlMobile?: string;
  linkUrl: string;
  altText: string;
  openInNewTab: boolean;
}

export interface CodeBlock {
  type: "code";
  html: string;
}

export interface MultimediaBlock {
  type: "multimedia";
  platform: "youtube" | "instagram";
  url: string;
  videoId?: string;
  title: string;
  category?: string;
  thumbnailUrl: string;
  accentColor?: string;
  publishedAt?: string;
}

export type Block = ArticleBlock | BannerBlock | CodeBlock | MultimediaBlock;

export interface DragItem {
  type: "article" | "banner" | "code" | "multimedia";
  articleId?: string;
  snapshot?: ArticleBlock["snapshot"];
  bannerData?: Omit<BannerBlock, "type">;
  html?: string;
  multimediaData?: Omit<MultimediaBlock, "type">;
}

export const TEMPLATE_MOBILE_BREAKPOINT: Partial<Record<TemplateId, number>> = {
  "tres-notas-principales": 512,
  "dos-notas-secundarias": 512,
  "dos-notas-sin-foto": 512,
  cuadricula: 512,
  "tres-notas-secundarias": 736,
  "mas-notas-edm": 736,
  "video-destacado": 736,
  "cuatro-notas-secundarias": 700,
  "cuatro-notas-sin-foto": 700,
  "multimedia-reels": 900,
  "multimedia-youtube": 900,
  "edm-horizontal": 1100,
};

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
  "edm-carrusel": {
    label: "Carrusel EDM (7 notas)",
    slotsCount: 7,
    optionalSlots: true,
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateAreas: `"a b c d e f g"`,
    slots: [
      { variant: "nota-edm-vertical", gridArea: "a" },
      { variant: "nota-edm-vertical", gridArea: "b" },
      { variant: "nota-edm-vertical", gridArea: "c" },
      { variant: "nota-edm-vertical", gridArea: "d" },
      { variant: "nota-edm-vertical", gridArea: "e" },
      { variant: "nota-edm-vertical", gridArea: "f" },
      { variant: "nota-edm-vertical", gridArea: "g" },
    ],
  },
  "mas-notas-edm": {
    label: "Más notas EDM",
    slotsCount: 16,
    optionalSlots: true,
    gridTemplateColumns: "1fr 1fr 1fr 1.3fr",
    gridTemplateRows: "repeat(7, minmax(0, 1fr))",
    gridTemplateAreas: `
      "a1 a2 a3 r1"
      "a1 a2 a3 r2"
      "a1 a2 a3 r3"
      "a4 a5 a6 r4"
      "a4 a5 a6 r5"
      "a7 a8 a9 r6"
      "a7 a8 a9 r7"
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
      { variant: "nota-edm", gridArea: "r7" },
    ],
  },
  banner: {
    label: "Banner",
    slotsCount: 1,
    gridTemplateColumns: "1fr",
    gridTemplateAreas: `"banner"`,
    slots: [{ variant: "banner", gridArea: "banner" }],
  },
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
  "multimedia-reels": {
    label: "Multimedia: Instagram Reels (5)",
    slotsCount: 5,
    optionalSlots: true,
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateAreas: `"r1 r2 r3 r4 r5"`,
    slots: [
      { variant: "multimedia-reel", gridArea: "r1" },
      { variant: "multimedia-reel", gridArea: "r2" },
      { variant: "multimedia-reel", gridArea: "r3" },
      { variant: "multimedia-reel", gridArea: "r4" },
      { variant: "multimedia-reel", gridArea: "r5" },
    ],
  },
  "multimedia-youtube": {
    label: "Multimedia: YouTube / Programas (10)",
    slotsCount: 10,
    optionalSlots: true,
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateAreas: `"y1 y2 y3 y4"`,
    slots: Array.from({ length: 10 }, (_, i) => ({
      variant: "multimedia-youtube" as const,
      gridArea: i < 4 ? `y${i + 1}` : "",
    })),
  },
  "video-destacado": {
    label: "Video + Nota o Video + Video (Autoplay)",
    slotsCount: 2,
    optionalSlots: true,
    gridTemplateColumns: "1.4fr 1fr",
    gridTemplateAreas: `"video-main companion"`,
    slots: [
      { variant: "video-destacado-primary", gridArea: "video-main" },
      { variant: "video-destacado-secondary", gridArea: "companion" },
    ],
  },
};

export function slotVariantAt(
  template: TemplateId,
  slotIndex: number,
): SlotVariant | null {
  return TEMPLATE_SPECS[template].slots[slotIndex]?.variant ?? null;
}

export function slotAcceptsBanner(variant: SlotVariant): boolean {
  return variant === "banner";
}

export function codeColumnWidthsFor(region: Region): number[] {
  const columns = region.codeColumns ?? 1;
  const stored = region.codeColumnWidths;
  return stored && stored.length === columns ? stored : Array(columns).fill(1);
}

export function slotAcceptsCode(variant: SlotVariant): boolean {
  return variant === "code";
}

export function slotAccepts(variant: SlotVariant, blockType: Block["type"]): boolean {
  if (slotAcceptsCode(variant)) return true;
  if (variant === "video-destacado-primary") {
    return blockType === "multimedia";
  }
  if (variant === "video-destacado-secondary") {
    return blockType === "article" || blockType === "multimedia" || blockType === "code";
  }
  if (variant === "multimedia-reel" || variant === "multimedia-youtube") {
    return blockType === "multimedia";
  }
  if (slotAcceptsBanner(variant)) return blockType === "banner" || blockType === "code";
  return blockType === "article";
}