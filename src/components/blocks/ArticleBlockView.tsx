import type { ArticleBlock } from "../../types/layout";

interface Props {
  block: ArticleBlock;
}

export default function ArticleBlockView({ block }: Props) {
  const { snapshot } = block;

  return (
    <div className="flex gap-[15px] items-start group">
      {/* Image */}
      {snapshot.imageUrl && (
        <div className="w-[88px] h-[88px] overflow-hidden rounded-[4px] bg-neutral-100">
          <img
            src={snapshot.imageUrl}
            alt={snapshot.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 gap-y-[5px]">
        {/* Volanta */}
        {snapshot.volanta && (
          <p className="text-[10px] font-bold text-[#0070f3] uppercase tracking-[0.65px] leading-none m-0">
            {snapshot.volanta}
          </p>
        )}

        {/* Title */}
        <h5 className="font-semibold text-[13.5px] text-[#111] line-clamp-2">
          {snapshot.title}
        </h5>

        {/* Excerpt */}
        {snapshot.excerpt && (
          <p className="m-0 text-[11.5px] text-[#666] line-clamp-2">
            {snapshot.excerpt}
          </p>
        )}

        {/* Footer row */}
        {snapshot.categoryName && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9.5px] font-semibold text-[#888] bg-[#f2f2f2] px-[6px] py-[2px] rounded-[3px] uppercase tracking-[0.4px]">
              {snapshot.categoryName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
