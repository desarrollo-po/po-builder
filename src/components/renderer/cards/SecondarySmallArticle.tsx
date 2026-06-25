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
      className="@container flex h-full flex-col text-inherit no-underline shadow-[0_0_15px_0_rgba(0,0,0,0.10)]"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {snapshot.imageUrl && (
        <div className="w-full shrink-0 overflow-hidden h-[200px] bg-[--surface-secondary]">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-[10px] p-[15px]">
        <h2 className="text-[18px] font-extrabold leading-tight text-gray-900 tracking-tight">
          {snapshot.title}
        </h2>
        {snapshot.descripcionDestacado && (
          <p className="m-0 text-[15px] leading-tight">
            {snapshot.descripcionDestacado}
          </p>
        )}
      </div>
    </a>
  );
}
