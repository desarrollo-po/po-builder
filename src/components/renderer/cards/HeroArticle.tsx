import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";
import { pickImage } from "../../../lib/wpImage";

interface Props {
  article: ArticleBlock;
}

export default function HeroArticle({ article }: Props) {
  const { snapshot } = article;
  const sectionColor = getSectionColor(snapshot.categoryName);

  return (
    <article
      className="@container flex @max-md:flex-col h-full gap-[14px] @max-md:gap-0"
    >
      {snapshot.imageUrl && (
        <div className="w-[45%] @max-md:w-full flex-shrink-0 overflow-hidden bg-[var(--surface-secondary)]">
          <img
            src={pickImage(snapshot, "medium_large", "large")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-start gap-2 py-[14px] pr-4 @max-md:px-3">
        {snapshot.volanta && (
          <span
            className="text-[11px] font-bold uppercase tracking-[0.6px]"
            style={{ color: sectionColor }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h2 className="m-0 line-clamp-3 text-[30px] @max-md:text-[18px] @max-md:font-extrabold @max-md:leading-tight @max-md:tracking-tight font-extrabold leading-[1.15] text-[var(--text-primary)]">
          {snapshot.title}
        </h2>
        {snapshot.excerpt && (
          <p className="m-0 line-clamp-3 text-[12.5px] leading-[1.45] text-[var(--text-secondary)]">
            {snapshot.excerpt}
          </p>
        )}
      </div>
    </article>
  );
}
