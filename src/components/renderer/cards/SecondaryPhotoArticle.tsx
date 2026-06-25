import { getSectionColor } from "../../../lib/sectionColors";
import type { ArticleBlock } from "../../../types/layout";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function SecondaryPhotoArticle({ article }: Props) {
  const { snapshot } = article;
  const accent = getSectionColor(snapshot.categoryName);
  return (
    <a
      href={articleHref(snapshot)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col text-inherit no-underline shadow-[0_0_15px_0_rgba(0,0,0,0.10)]"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {snapshot.imageUrl && (
        <div className="w-full h-[420px] @max-md:flex-[1_1_55%] overflow-hidden">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5 px-[14px] py-lg">
        <h2 className="text-[30px] @max-md:text-[18px] @max-md:font-extrabold @max-md:leading-tight @max-md:tracking-tight font-bold leading-tight">
          {snapshot.title}
        </h2>
        {snapshot.descripcionDestacado && (
          <p className="m-0 line-clamp-2 text-[16px] leading-[1.4]">
            {snapshot.descripcionDestacado}
          </p>
        )}
      </div>
    </a>
  );
}
