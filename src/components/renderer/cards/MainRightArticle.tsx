import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function MainRightArticle({ article }: Props) {
  const { snapshot } = article;
  const sectionColor = getSectionColor(snapshot.categoryName);

  return (
    <a
      href={articleHref(snapshot)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col text-inherit no-underline"
    >
      {snapshot.imageUrl && (
        <div className="h-[150px] w-full flex-shrink-0 overflow-hidden bg-[var(--surface-secondary)]">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-[10px] py-[15px]">
        {snapshot.volanta && (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.5px]"
            style={{ color: sectionColor }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h4 className="m-0 line-clamp-3 text-[18px] font-bold leading-[1.25] text-[var(--text-primary)]">
          {snapshot.title}
        </h4>
        {snapshot.descripcionDestacado && (
          <span className="text-[14px] font-extralight leading-[1.2]">{snapshot.descripcionDestacado}</span>
        )}
      </div>
    </a>
  );
}
