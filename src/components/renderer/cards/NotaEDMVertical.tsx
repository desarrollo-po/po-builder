import { pickImage } from "../../../lib/wpImage";
import type { ArticleBlock } from "../../../types/layout";

interface Props {
  article: ArticleBlock;
}

export default function NotaEDMVertical({ article }: Props) {
  const { snapshot } = article;
  const author = snapshot.author || snapshot.volanta;

  return (
    <article className="flex flex-col">
      {snapshot.imageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img
            src={pickImage(snapshot, "medium", "medium_large")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 p-2">
        <h2 className="m-0 text-[18px] font-bold leading-tight text-white">
          {snapshot.title}
        </h2>
        {author && (
          <span className="mt-auto text-[14px] font-medium text-white/80">
            {author}
          </span>
        )}
      </div>
    </article>
  );
}
