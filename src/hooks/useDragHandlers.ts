import type { DragEndEvent } from "@dnd-kit/core";
import { useLayoutStore } from "../store/layoutStore";
import {
  slotVariantAt,
  slotAccepts,
  type PageLayout,
  type Block,
  type ArticleBlock,
  type BannerBlock,
  type CodeBlock,
  type MultimediaBlock,
} from "../types/layout";

interface SlotTarget {
  regionId: string;
  slotIndex: number;
  targetMobileImage?: boolean;
}

interface SlotAssignActions {
  setSlotBlock: (regionId: string, slotIndex: number, block: Block) => void;
  updateBannerImageMobile: (regionId: string, slotIndex: number, imageUrlMobile: string) => void;
}

export function applySourceToSlot(
  layout: PageLayout,
  actions: SlotAssignActions,
  target: SlotTarget,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sourceData: any,
) {
  if (
    sourceData?.type !== "article" &&
    sourceData?.type !== "banner" &&
    sourceData?.type !== "code" &&
    sourceData?.type !== "multimedia"
  )
    return;

  const region = layout.layout.find((r) => r.id === target.regionId);
  if (!region) return;
  const variant = slotVariantAt(region.template, target.slotIndex);
  if (!variant) return;

  if (!slotAccepts(variant, sourceData.type)) return;

  if (target.targetMobileImage) {
    if (sourceData.type !== "banner") return;
    actions.updateBannerImageMobile(target.regionId, target.slotIndex, sourceData.bannerData.imageUrl);
    return;
  }

  if (sourceData.type === "banner") {
    const banner: BannerBlock = {
      type: "banner",
      mediaId: sourceData.bannerData?.mediaId,
      imageUrl: sourceData.bannerData.imageUrl,
      linkUrl: sourceData.bannerData.linkUrl ?? "",
      altText: sourceData.bannerData.altText ?? "",
      openInNewTab: Boolean(sourceData.bannerData.openInNewTab),
    };
    actions.setSlotBlock(target.regionId, target.slotIndex, banner);
  } else if (sourceData.type === "code") {
    const code: CodeBlock = { type: "code", html: sourceData.html ?? "" };
    actions.setSlotBlock(target.regionId, target.slotIndex, code);
  } else if (sourceData.type === "multimedia") {
    const multimedia: MultimediaBlock = {
      type: "multimedia",
      platform: sourceData.multimediaData.platform,
      url: sourceData.multimediaData.url,
      videoId: sourceData.multimediaData.videoId,
      title: sourceData.multimediaData.title ?? "",
      category: sourceData.multimediaData.category ?? "",
      thumbnailUrl: sourceData.multimediaData.thumbnailUrl ?? "",
      accentColor: sourceData.multimediaData.accentColor ?? "#3d4451",
    };
    actions.setSlotBlock(target.regionId, target.slotIndex, multimedia);
  } else {
    const article: ArticleBlock = {
      type: "article",
      articleId: sourceData.articleId,
      snapshot: sourceData.snapshot,
    };
    actions.setSlotBlock(target.regionId, target.slotIndex, article);
  }
}

export default function useDragHandlers() {
  const { layout, setSlotBlock, swapSlots, reorderRegions, updateBannerImageMobile } = useLayoutStore();

  const handleDragEnd = (event: DragEndEvent) => {
    if (!layout) return;
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Sidebar article / banner / code / multimedia → slot
    if (
      (activeData?.type === "article" ||
        activeData?.type === "banner" ||
        activeData?.type === "code" ||
        activeData?.type === "multimedia") &&
      overData?.kind === "slot"
    ) {
      applySourceToSlot(
        layout,
        { setSlotBlock, updateBannerImageMobile },
        {
          regionId: overData.regionId,
          slotIndex: overData.slotIndex,
          targetMobileImage: overData.targetMobileImage,
        },
        activeData,
      );
      return;
    }

    // Slot block → slot (swap, same or cross region)
    if (activeData?.kind === "slot-article" && overData?.kind === "slot") {
      if (
        activeData.regionId === overData.regionId &&
        activeData.slotIndex === overData.slotIndex
      ) {
        return;
      }

      const fromRegion = layout.layout.find((r) => r.id === activeData.regionId);
      const toRegion = layout.layout.find((r) => r.id === overData.regionId);
      if (!fromRegion || !toRegion) return;
      const fromVariant = slotVariantAt(fromRegion.template, activeData.slotIndex);
      const toVariant = slotVariantAt(toRegion.template, overData.slotIndex);
      if (!fromVariant || !toVariant) return;
      const fromBlock = fromRegion.blocks[activeData.slotIndex];
      const toBlock = toRegion.blocks[overData.slotIndex];
      if (fromBlock && !slotAccepts(toVariant, fromBlock.type)) return;
      if (toBlock && !slotAccepts(fromVariant, toBlock.type)) return;

      swapSlots(
        activeData.regionId,
        activeData.slotIndex,
        overData.regionId,
        overData.slotIndex,
      );
      return;
    }

    // Region reorder
    if (
      !activeData?.kind &&
      !activeData?.type &&
      !overData?.kind &&
      !overData?.type
    ) {
      const regionIds = layout.layout.map((r) => r.id);
      const oldIndex = regionIds.indexOf(active.id as string);
      const newIndex = regionIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const next = [...regionIds];
      next.splice(oldIndex, 1);
      next.splice(newIndex, 0, active.id as string);
      reorderRegions(next);
    }
  };

  return { handleDragEnd };
}