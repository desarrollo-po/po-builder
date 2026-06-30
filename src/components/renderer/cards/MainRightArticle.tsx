import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";
import { pickImage } from "../../../lib/wpImage";

interface Props {
  article: ArticleBlock;
}

export default function MainRightArticle({ article }: Props) {
  const { snapshot } = article;
  const accent = getSectionColor(snapshot.categorySlug ?? snapshot.categoryName);

  return (
    <article
      className="flex h-full bg-white flex-col shadow-[0_0_15px_0_rgba(0,0,0,0.10)]"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {snapshot.imageUrl && (
        <div className="h-[150px] @max-md:h-auto @max-md:w-full @max-md:flex-[1_1] w-full flex-shrink-0 overflow-hidden bg-[var(--surface-secondary)]">
          <img
            src={pickImage(snapshot, "medium", "medium_large")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-[10px] py-[15px]">
        {snapshot.volanta && (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.5px]"
            style={{ color: accent }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h2 className="m-0 text-[18px] @max-md:text-[18px] @max-md:font-extrabold @max-md:leading-tight @max-md:tracking-tight font-bold leading-[1.25] text-[var(--text-primary)]">
          {snapshot.title}
        </h2>
        {snapshot.descripcionDestacado && (
          <span className="text-[14px] font-extralight leading-[1.2]">{snapshot.descripcionDestacado}</span>
        )}
      </div>
    </article>
  );
}
