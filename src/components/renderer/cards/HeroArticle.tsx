import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function HeroArticle({ article }: Props) {
  const { snapshot } = article;
  const sectionColor = getSectionColor(snapshot.categoryName);

  return (
    <a
      href={articleHref(snapshot)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full gap-[14px] text-inherit no-underline"
    >
      {snapshot.imageUrl && (
        <div className="w-[45%] flex-shrink-0 overflow-hidden bg-[var(--surface-secondary)]">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-start gap-2 py-[14px] pr-4">
        {snapshot.volanta && (
          <span
            className="text-[11px] font-bold uppercase tracking-[0.6px]"
            style={{ color: sectionColor }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h3 className="m-0 line-clamp-3 text-[30px] font-extrabold leading-[1.15] text-[var(--text-primary)]">
          {snapshot.title}
        </h3>
        {snapshot.excerpt && (
          <p className="m-0 line-clamp-3 text-[12.5px] leading-[1.45] text-[var(--text-secondary)]">
            {snapshot.excerpt}
          </p>
        )}
      </div>
    </a>
  );
}
