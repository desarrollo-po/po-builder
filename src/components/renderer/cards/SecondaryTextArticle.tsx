import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function SecondaryTextArticle({ article }: Props) {
  const { snapshot } = article;
  const accent = getSectionColor(snapshot.categoryName);

  return (
    <a
      href={articleHref(snapshot)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col gap-2 px-[14px] pb-[12px] pt-[14px] text-inherit no-underline"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {snapshot.volanta && (
        <span
          className="text-[10.5px] font-extrabold uppercase tracking-[0.7px]"
          style={{ color: accent }}
        >
          {snapshot.volanta}
        </span>
      )}
      <h4 className="m-0 line-clamp-4 text-[14px] font-extrabold leading-[1.25] text-[var(--text-primary)]">
        {snapshot.title}
      </h4>
      {snapshot.excerpt && (
        <p className="m-0 line-clamp-2 text-[11.5px] leading-[1.4] text-[var(--text-secondary)]">
          {snapshot.excerpt}
        </p>
      )}
    </a>
  );
}
