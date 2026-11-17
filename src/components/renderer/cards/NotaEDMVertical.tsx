import { pickImage } from "../../../lib/wpImage";
import type { ArticleBlock } from "../../../types/layout";

interface Props {
  article: ArticleBlock;
}

function formatNumericDate(isoDate?: string): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function NotaEDMVertical({ article }: Props) {
  const { snapshot } = article;
  const author = snapshot.author || snapshot.volanta;
  const edition = snapshot.categoryName;
  const formattedDate = formatNumericDate(snapshot.publishedAt);

  return (
    <article className="flex h-full flex-col rounded-xl bg-white/[0.04] p-2.5 transition-colors hover:bg-white/[0.08]">
      {snapshot.imageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
          <img
            src={pickImage(snapshot, "medium", "medium_large")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mt-2.5 flex flex-1 flex-col gap-1.5">
        {(edition || formattedDate) && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
            {edition && (
              <span className="rounded-full bg-[#e23b1a]/25 px-2 py-0.5 text-[#ff6b4a]">
                {edition}
              </span>
            )}
            {formattedDate && (
              <span className="text-white/55">{formattedDate}</span>
            )}
          </div>
        )}

        <h2 className="m-0 text-[16px] font-bold leading-snug text-white">
          {snapshot.title}
        </h2>

        {author && (
          <span className="mt-auto pt-1 text-[13px] font-medium text-white/75">
            {author}
          </span>
        )}
      </div>
    </article>
  );
}