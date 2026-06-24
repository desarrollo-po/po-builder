import type { ArticleBlock } from "../../../types/layout";
import { getSectionColor } from "../../../lib/sectionColors";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function MainLeftArticle({ article }: Props) {
  const { snapshot } = article;
  const sectionColor = getSectionColor(snapshot.categoryName);

  return (
    <a
      href={articleHref(snapshot)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col text-inherit no-underline"
    >
      {snapshot.imageUrl && (
        <div className="w-full h-[420px] flex-[1_1_65%] overflow-hidden bg-[var(--surface-secondary)]">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 px-[14px] py-[12px]">
        {snapshot.volanta && (
          <span
            className="text-[10.5px] font-bold uppercase tracking-[0.5px]"
            style={{ color: sectionColor }}
          >
            {snapshot.volanta}
          </span>
        )}
        <h3 className="m-0 text-[30px] font-extrabold leading-[1.2] text-[var(--text-primary)]">
          {snapshot.title}
        </h3>
      </div>
    </a>
  );
}
