import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";
import { pickImage } from "../../../lib/wpImage";

interface Props {
  article: ArticleBlock;
}

function formatEdmDate(isoDate?: string | null): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function MainLeftArticle({ article }: Props) {
  const { snapshot } = article;
  const accent = getSectionColor(snapshot.categorySlug ?? snapshot.categoryName);
  const edition = snapshot.source === "edm" ? snapshot.categoryName : null;
  const formattedDate = formatEdmDate(snapshot.publishedAt);

  return (
    <article
      className="bg-white flex h-full flex-col shadow-[0_0_15px_0_rgba(0,0,0,0.10)]"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {snapshot.imageUrl && (
        <div className="w-full h-[460px] @max-[512px]:h-auto @max-[512px]:flex-[1_1_55%] overflow-hidden">
          <img
            src={pickImage(snapshot, "medium_large", "large")}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 p-3.5">
        {(edition || formattedDate || snapshot.volanta) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {edition && (
              <span className="rounded-full bg-[#e23b1a]/20 px-2 py-0.5 text-[11px] font-medium text-[#c93012]">
                {edition}
              </span>
            )}
            {formattedDate && (
              <span className="text-[11px] font-medium text-neutral-500">
                {formattedDate}
              </span>
            )}
            {snapshot.volanta && (
              <span
                className="text-[10.5px] font-bold uppercase tracking-[0.5px]"
                style={{ color: accent }}
              >
                {snapshot.volanta}
              </span>
            )}
          </div>
        )}
        <h2 className="m-0 text-[30px] @max-[512px]:text-[18px] @max-[512px]:font-extrabold @max-[512px]:leading-tight @max-[512px]:tracking-tight font-extrabold leading-[1.2] text-[var(--text-primary)]">
          {snapshot.title}
        </h2>
        {snapshot.descripcionDestacado && (
          <span className="text-[16px] font-extralight leading-tight">{snapshot.descripcionDestacado}</span>
        )}
      </div>
    </article>
  );
}