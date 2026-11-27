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

function getSnapshotImageUrl(snapshot: ArticleBlock["snapshot"]): string {
  const snap = snapshot as Record<string, unknown>;
  const candidates = [
    snap.imageUrl,
    snap.thumbnailUrl,
    snap.image,
    snap.cover,
    snap.coverUrl,
  ];
  for (const val of candidates) {
    if (typeof val === "string" && val.trim()) {
      return val.trim();
    }
  }
  return "";
}

function getSnapshotEdition(snapshot: ArticleBlock["snapshot"]): string {
  const snap = snapshot as Record<string, unknown>;
  const raw =
    snap.edition ??
    snap.edicion ??
    snap.editionLabel ??
    snap.edicionLabel ??
    snap.issue ??
    snap.editionNumber ??
    snap.numero ??
    snap.categoryName ??
    snap.category;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return `EDM Digital #${raw}`;
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    return /^\d+$/.test(trimmed) ? `EDM Digital #${trimmed}` : trimmed;
  }
  return "";
}

function formatDateDdMmYyyy(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const day = String(parsed.getUTCDate()).padStart(2, "0");
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const year = parsed.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }
  return trimmed;
}

function getSnapshotDate(snapshot: ArticleBlock["snapshot"]): string {
  const snap = snapshot as Record<string, unknown>;
  const raw =
    snap.date ??
    snap.fecha ??
    snap.publishedAt ??
    snap.createdAt;

  if (typeof raw === "string" && raw.trim()) {
    return formatDateDdMmYyyy(raw);
  }
  return "";
}

function EdmHomogenizedCard({
  article,
  equalHeight = false,
}: {
  article: ArticleBlock;
  equalHeight?: boolean;
}) {
  const snap = article.snapshot as {
    title?: string;
    author?: string;
    authors?: string[];
  };
  const title = snap.title ?? "";
  const author =
    snap.author ??
    (Array.isArray(snap.authors) ? snap.authors.join(", ") : "");
  const imageUrl = getSnapshotImageUrl(article.snapshot);
  const edition = getSnapshotEdition(article.snapshot);
  const date = getSnapshotDate(article.snapshot);

  return (
    <div
      data-edm-card="true"
      className="flex h-full w-full flex-col justify-start overflow-hidden bg-[#191919] text-white"
    >
      {imageUrl && (
        <div
          className={
            equalHeight
              ? "max-h-[210px] w-full shrink-0 overflow-hidden sm:max-h-[235px]"
              : "min-h-0 flex-1 overflow-hidden"
          }
        >
          <img
            src={imageUrl}
            alt={title || "Nota EDM"}
            className={
              equalHeight
                ? "h-full max-h-[210px] w-full object-cover sm:max-h-[235px]"
                : "h-full w-full object-cover"
            }
          />
        </div>
      )}
      <div
        className={`flex flex-1 flex-col justify-start ${
          equalHeight ? "px-4 pt-3 pb-4" : "px-4 pt-3 pb-5"
        }`}
      >
        {(edition || date) && (
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {edition && (
              <span
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 100 }}
                className="edm-date-inter font-thin rounded-full bg-[#3a1614] px-2 py-0.5 text-[10.5px] tracking-wide text-[#ff6b57]"
              >
                {edition}
              </span>
            )}
            {date && (
              <span className="edm-date-inter rounded-full border border-neutral-800 bg-[#151517] px-2.5 py-0.5 text-[11px] tracking-tight text-neutral-200">
                {date}
              </span>
            )}
          </div>
        )}
        <h3
          className={`edm-title-oswald ${
            equalHeight
              ? "text-xl leading-snug sm:text-2xl"
              : "text-2xl leading-tight sm:text-[28px]"
          } tracking-tight text-white`}
        >
          {title}
        </h3>
        {author && (
          <span
            className={`edm-meta-cascadia ${
              equalHeight ? "mt-2" : "mt-3"
            } block text-[13px] uppercase tracking-wider text-red-500`}
          >
            {author}
          </span>
        )}
      </div>
    </div>
  );
}

function YoutubeFeaturedEmbed({
  item,
  autoplay = true,
}: {
  item: MultimediaBlock;
  autoplay?: boolean;
}) {
  if (!item.videoId) {
    return <MultimediaYoutubeCard item={item} />;
  }

  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    playsinline: "1",
    rel: "0",
  });

  if (autoplay) {
    params.set("mute", "1");
    params.set("loop", "1");
    params.set("playlist", item.videoId);
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black shadow-sm">
      <iframe
        key={`${item.videoId}-${autoplay ? "autoplay" : "static"}`}
        src={`https://www.youtube.com/embed/${item.videoId}?${params.toString()}`}
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
  autoplay?: boolean;
}

export default function BlockRenderer({ block, variant, autoplay = true }: Props) {
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
      return <YoutubeFeaturedEmbed item={block} autoplay={autoplay} />;
    }
    return <MultimediaYoutubeCard item={block} />;
  }

  if (variant === "code" && block.snapshot.source === "edm") {
    return <EdmHomogenizedCard article={block} equalHeight />;
  }

  if (variant === "video-destacado-secondary" && block.snapshot.source === "edm") {
    return <EdmHomogenizedCard article={block} />;
  }

  const ArticleCard = ARTICLE_CARDS[variant];
  if (!ArticleCard) return null;
  return <ArticleCard article={block} />;
}