import { pickImage } from "../../../lib/wpImage";
import type { ArticleBlock } from "../../../types/layout";

interface Props {
  article: ArticleBlock;
}

// code-region (Bloque flexible) columns can mix general articles with EDM
// ones, and don't carry the red background NotaEDM/NotaEDMVertical rely on —
// so this card paints its own red box instead of assuming the parent does.
export default function NotaEDMFlexible({ article }: Props) {
  const { snapshot } = article;

  return (
    <article className="flex h-full w-full flex-col overflow-hidden bg-[#e23b1a]">
      {snapshot.imageUrl && (
        <div className="w-full shrink-0 overflow-hidden h-[200px]">
          <img
            src={pickImage(snapshot, "medium", "medium_large")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-[10px] p-[15px]">
        <h2 className="m-0 text-[18px] font-extrabold leading-tight text-white tracking-tight">
          {snapshot.title}
        </h2>
        {(snapshot.descripcionDestacado || snapshot.excerpt) && (
          <p className="m-0 line-clamp-3 text-[15px] leading-tight text-white/90">
            {snapshot.descripcionDestacado || snapshot.excerpt}
          </p>
        )}
        {snapshot.volanta && (
          <span className="mt-auto text-[14px] font-medium text-white/80">
            {snapshot.volanta}
          </span>
        )}
      </div>
    </article>
  );
}
