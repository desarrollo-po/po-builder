import type { BannerBlock } from "../../../types/layout";

interface Props {
  banner: BannerBlock;
}

export default function BannerCard({ banner }: Props) {
  // A banner without a target URL is essentially a static image — render it
  // unwrapped so we don't ship an <a> that goes nowhere.
  if (!banner.linkUrl.trim()) {
    return (
      <img
        src={banner.imageUrl}
        alt={banner.altText}
        className="block h-full w-full object-cover"
      />
    );
  }

  return (
    <a
      href={banner.linkUrl}
      target={banner.openInNewTab ? "_blank" : undefined}
      rel={banner.openInNewTab ? "noopener noreferrer" : undefined}
      className="block h-full"
    >
      <img
        src={banner.imageUrl}
        alt={banner.altText}
        className="block h-full w-full object-cover"
      />
    </a>
  );
}
