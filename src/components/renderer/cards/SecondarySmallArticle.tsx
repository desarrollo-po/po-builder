import { getSectionColor } from "../../../lib/sectionColors";
import type { ArticleBlock } from "../../../types/layout";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function SecondarySmallArticle({ article }: Props) {
  const { snapshot } = article;
  const accent = getSectionColor(snapshot.categoryName);

  return (
    <a
      href={articleHref(snapshot)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col text-inherit no-underline"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {snapshot.imageUrl && (
        <div className="w-full flex-[1_1_55%] overflow-hidden bg-[--surface-secondary]">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-[3px] px-3 py-[10px]">
        <h4 className="text-[18px] font-extrabold leading-tight text-gray-900 tracking-tight">
          {snapshot.title}
        </h4>
        {snapshot.descripcionDestacado && (
          <p className="m-0 text-[15px] leading-tight text-[var(--text-secondary)]">
            {snapshot.descripcionDestacado}
          </p>
        )}
      </div>
    </a>
  );
}
