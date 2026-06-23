import type { ArticleBlock } from "../../../types/layout";
import { articleHref } from "./articleHref";

interface Props {
  article: ArticleBlock;
}

export default function SecondarySmallArticle({ article }: Props) {
  const { snapshot } = article;

  return (
    <a
      href={articleHref(snapshot)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col text-inherit no-underline"
    >
      {snapshot.imageUrl && (
        <div className="w-full flex-[1_1_55%] overflow-hidden bg-[--surface-secondary]">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-[3px] px-3 py-[10px]">
        <h4 className="text-[18px] font-extrabold leading-tight text-gray-900 tracking-tight">
          {snapshot.title}
        </h4>
      </div>
    </a>
  );
}
