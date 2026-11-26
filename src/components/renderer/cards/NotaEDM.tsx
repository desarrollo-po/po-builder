import { pickImage } from "../../../lib/wpImage";
import type { ArticleBlock } from "../../../types/layout";

interface Props {
  article: ArticleBlock;
}

function formatDateDDMMYYYY(isoDate?: string | null): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function NotaEDM({ article }: Props) {
  const { snapshot } = article;
  const author = snapshot.author || snapshot.volanta;
  const formattedDate = formatDateDDMMYYYY(snapshot.publishedAt);
  const edition = snapshot.categoryName;

  return (
    <article className="flex h-full items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-white/20 hover:bg-white/[0.07]">
      {snapshot.imageUrl && (
        <div className="aspect-[16/9] w-[116px] shrink-0 overflow-hidden rounded-lg bg-black/40">
          <img
            src={pickImage(snapshot, "medium", "medium_large")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {edition && (
            <span className="rounded-full border border-[#e23b1a]/30 bg-[#e23b1a]/20 px-2 py-0.5 text-[10px] font-semibold text-[#ff6b4a]">
              {edition}
            </span>
          )}
          {formattedDate && (
            <span className="text-[11px] text-neutral-400">{formattedDate}</span>
          )}
        </div>

        <h3 className="m-0 line-clamp-2 text-[15.5px] font-bold leading-snug text-white">
          {snapshot.title}
        </h3>

        {author && (
          <span className="truncate text-[13px] font-medium text-neutral-300">
            {author}
          </span>
        )}
      </div>
    </article>
  );
}