import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function MainLeftArticle({ article }: Props) {
  const { snapshot } = article;
  const sectionColor = getSectionColor(snapshot.categoryName);
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
        <div className="w-full h-[460px] @max-md:h-auto @max-md:flex-[1_1_55%] overflow-hidden">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 p-3.5">
        {snapshot.volanta && (
          <span
            className="text-[10.5px] font-bold uppercase tracking-[0.5px]"
            style={{ color: sectionColor }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h2 className="m-0 text-[30px] @max-md:text-[18px] @max-md:font-extrabold @max-md:leading-tight @max-md:tracking-tight font-extrabold leading-[1.2] text-[var(--text-primary)]">
          {snapshot.title}
        </h2>
        {snapshot.descripcionDestacado && (
          <span className="text-[16px] font-extralight leading-tight">{snapshot.descripcionDestacado}</span>
        )}
      </div>
    </a>
  );
}
