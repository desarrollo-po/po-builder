import type { BannerBlock } from "../../types/layout";

interface Props {
  block: BannerBlock;
}

export default function BannerBlockView({ block }: Props) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <img
        src={block.imageUrl}
        alt={block.altText}
        style={{
          width: "80px",
          height: "80px",
          objectFit: "cover",
          borderRadius: "4px",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", wordBreak: "break-word" }}>
          <a
            href={block.linkUrl}
            target={block.openInNewTab ? "_blank" : "_self"}
            rel={block.openInNewTab ? "noopener noreferrer" : undefined}
            style={{
              color: "var(--accent)",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {block.linkUrl}
          </a>
        </p>
        <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
          Alt: {block.altText || "(no alt text)"}
        </p>
      </div>
    </div>
  );
}
