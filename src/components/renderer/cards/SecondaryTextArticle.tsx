import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";

interface Props {
  article: ArticleBlock;
}

export default function SecondaryTextArticle({ article }: Props) {
  const { snapshot } = article;
  const accent = getSectionColor(snapshot.categoryName);

  return (
    <article
      className="@container bg-white flex h-full flex-col gap-2 px-[14px] pb-[12px] pt-[14px] shadow-[0_0_15px_0_rgba(0,0,0,0.10)]"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {snapshot.volanta && (
        <span
          className="text-[10.5px] font-extrabold uppercase tracking-[0.7px]"
        >
          {snapshot.volanta}
        </span>
      )}
      <h2 className="m-0 text-[18px] @max-md:text-[18px] @max-md:font-extrabold @max-md:leading-tight @max-md:tracking-tight font-semibold leading-tight text-[var(--text-primary)]">
        {snapshot.title}
      </h2>
      {snapshot.descripcionDestacado && (
        <p className="m-0 text-[15px] leading-tight text-[var(--text-secondary)]">
          {snapshot.descripcionDestacado}
        </p>
      )}
    </article>
  );
}
