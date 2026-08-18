import type { BannerBlock } from "../../../types/layout";

interface Props {
  banner: BannerBlock;
}

export default function BannerCard({ banner }: Props) {
  // Native <picture>/<source media> breakpoint — browser picks the right
  // image itself, no JS resize listener needed. Falls back to `imageUrl`
  // when no mobile-specific image was uploaded.
  const image = (
    <picture>
      {banner.imageUrlMobile && (
        <source media="(max-width: 767px)" srcSet={banner.imageUrlMobile} />
      )}
      <img
        src={banner.imageUrl}
        alt={banner.altText}
        className="block h-full w-full object-contain"
      />
    </picture>
  );

  // A banner without a target URL is essentially a static image — render it
  // unwrapped so we don't ship an <a> that goes nowhere.
  if (!banner.linkUrl.trim()) {
    return image;
  }

  return (
    <a
      href={banner.linkUrl}
      target={banner.openInNewTab ? "_blank" : undefined}
      rel={banner.openInNewTab ? "noopener noreferrer" : undefined}
      className="block h-full"
    >
      {image}
    </a>
  );
}
