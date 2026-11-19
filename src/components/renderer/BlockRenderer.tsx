import type { ComponentType } from "react";
import type { ArticleBlock, Block, MultimediaBlock, SlotVariant } from "../../types/layout";
import {
  BannerCard,
  CodeCard,
  MainLeftArticle,
  MainRightArticle,
  NotaEDM,
  SecondaryPhotoArticle,
  SecondarySmallArticle,
  SecondaryTextArticle,
  NotaPrincipal,
  NotaEDMVertical,
  NotaEDMFlexible,
  MultimediaReelCard,
  MultimediaYoutubeCard,
} from "./cards";

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
  "nota-edm-vertical": NotaEDMVertical,
  banner: null,
  code: SecondarySmallArticle,
  "multimedia-reel": null,
  "multimedia-youtube": null,
  "video-destacado-primary": null,
  "video-destacado-secondary": MainLeftArticle,
};

function AutoplayYoutubeEmbed({ item }: { item: MultimediaBlock }) {
  if (!item.videoId) {
    return <MultimediaYoutubeCard item={item} />;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black shadow-sm">
      <iframe
        src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${item.videoId}&rel=0`}
        title={item.title || "Video destacado"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}

interface Props {
  block: Block | null;
  variant: SlotVariant;
}

export default function BlockRenderer({ block, variant }: Props) {
  if (!block) return null;

  if (block.type === "banner") {
    return <BannerCard banner={block} />;
  }

  if (block.type === "code") {
    return <CodeCard code={block} />;
  }

  if (block.type === "multimedia") {
    if (variant === "multimedia-reel") {
      return <MultimediaReelCard item={block} />;
    }
    if (variant === "video-destacado-primary") {
      return <AutoplayYoutubeEmbed item={block} />;
    }
    return <MultimediaYoutubeCard item={block} />;
  }

  if (variant === "code" && block.snapshot.source === "edm") {
    return <NotaEDMFlexible article={block} />;
  }

  const ArticleCard = ARTICLE_CARDS[variant];
  if (!ArticleCard) return null;
  return <ArticleCard article={block} />;
}