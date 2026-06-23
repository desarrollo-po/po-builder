import type { ArticleBlock } from "../../../types/layout";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function SecondaryPhotoArticle({ article }: Props) {
  const { snapshot } = article;

  return (
    <a
      href={articleHref(snapshot)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col text-inherit no-underline"
    >
      {snapshot.imageUrl && (
        <div className="w-full flex-[1_1_60%] overflow-hidden bg-[var(--surface-secondary)]">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5 px-[14px] py-[12px]">
        <h4 className="m-0 line-clamp-3 text-[30px] font-bold leading-[1.25] text-[var(--text-primary)]">
          {snapshot.title}
        </h4>
        {snapshot.excerpt && (
          <p className="m-0 line-clamp-2 text-[16px] leading-[1.4] text-[var(--text-secondary)]">
            {snapshot.excerpt}
          </p>
        )}
      </div>
    </a>
  );
}
