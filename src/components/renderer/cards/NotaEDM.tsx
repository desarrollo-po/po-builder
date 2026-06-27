import { pickImage } from "../../../lib/wpImage";
import type { ArticleBlock } from "../../../types/layout";

interface Props {
  article: ArticleBlock;
}

// ponytail: author is squeezed into `snapshot.volanta` by the EDM source
// adapter (see src/sources/edm-articles.tsx). Promote to a dedicated field
// when a second source needs author rendering.
export default function NotaEDM({ article }: Props) {
  const { snapshot } = article;

  return (
    <article className="flex h-full w-full items-stretch gap-2 p-1.5">
      {snapshot.imageUrl && (
        <div className="aspect-video max-w-[40%] h-full shrink-0 overflow-hidden">
          <img
            src={pickImage(snapshot, "thumbnail", "medium")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
        <h2 className="m-0 line-clamp-3 font-semibold text-[16px] leading-tight text-white">
          {snapshot.title}
        </h2>
        {snapshot.volanta && (
          <span className="text-[14px] font-medium tracking-tight text-white">
            {snapshot.volanta}
          </span>
        )}
      </div>
    </article>
  );
}
