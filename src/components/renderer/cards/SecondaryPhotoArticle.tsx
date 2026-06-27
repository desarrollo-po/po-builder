import { getSectionColor } from "../../../lib/sectionColors";
import { pickImage } from "../../../lib/wpImage";
import type { ArticleBlock } from "../../../types/layout";

interface Props {
  article: ArticleBlock;
}

export default function SecondaryPhotoArticle({ article }: Props) {
  const { snapshot } = article;
  const accent = getSectionColor(snapshot.categoryName);
  return (
    <article
      className="flex relative h-full bg-white flex-col shadow-[0_0_15px_0_rgba(0,0,0,0.10)]"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {snapshot.volanta && (
        <div className="absolute left-2 top-2 z-10 bg-gray-700 py-1 px-2 text-white text-sm uppercase">
          {snapshot.volanta}
        </div>
      )}
      {snapshot.imageUrl && (
        <div className="w-full h-[420px] @max-md:flex-[1_1_55%] overflow-hidden">
          <img
            src={pickImage(snapshot, "medium_large", "large")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5 p-[15px]">
        <h2 className="text-[30px] @max-md:text-[18px] @max-md:font-extrabold @max-md:leading-tight @max-md:tracking-tight font-bold leading-tight">
          {snapshot.title}
        </h2>
        {snapshot.descripcionDestacado && (
          <p className="m-0 line-clamp-2 text-[16px] leading-[1.4]">
            {snapshot.descripcionDestacado}
          </p>
        )}
      </div>
    </article>
  );
}
