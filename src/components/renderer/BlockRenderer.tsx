import type { ComponentType } from "react";
import type { ArticleBlock, Block, SlotVariant } from "../../types/layout";
import {
  BannerCard,
  MainLeftArticle,
  MainRightArticle,
  NotaEDM,
  SecondaryPhotoArticle,
  SecondarySmallArticle,
  SecondaryTextArticle,
  NotaPrincipal
} from "./cards";

// Article cards per slot variant. Each variant has one visual that the
// designer locked in Figma — this map is the single point of truth.
// Adding a new variant = add a SlotVariant to the type, add an entry here.
// TypeScript will error on any variant left unmapped, so the contract is
// enforced at compile time and you can't forget a variant in production.
const ARTICLE_CARDS: Record<
  SlotVariant,
  ComponentType<{ article: ArticleBlock }> | null
> = {
  "nota-principal": NotaPrincipal,
  "main-left": MainLeftArticle,
  "main-right": MainRightArticle,
  "secondary-photo": SecondaryPhotoArticle,
  "secondary-small": SecondarySmallArticle,
  "secondary-text": SecondaryTextArticle,
  "nota-edm": NotaEDM,
  banner: null, // article never lands in a banner slot — gated by useDragHandlers
};

interface Props {
  block: Block | null;
  variant: SlotVariant;
}

// Single dispatch point: by block.type first, then by slot variant for
// articles. Banners ignore variant — they look the same wherever they land.
// Empty slots return null so the public view doesn't draw placeholder boxes.
export default function BlockRenderer({ block, variant }: Props) {
  if (!block) return null;

  if (block.type === "banner") {
    return <BannerCard banner={block} />;
  }

  const ArticleCard = ARTICLE_CARDS[variant];
  if (!ArticleCard) return null;
  return <ArticleCard article={block} />;
}
