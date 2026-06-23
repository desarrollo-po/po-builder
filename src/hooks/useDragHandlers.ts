import type { DragEndEvent } from "@dnd-kit/core";
import { useLayoutStore } from "../store/layoutStore";
import {
  slotVariantAt,
  slotAcceptsBanner,
  type ArticleBlock,
  type BannerBlock,
} from "../types/layout";

export default function useDragHandlers() {
  const { layout, setSlotBlock, swapSlots, reorderRegions } = useLayoutStore();

  const handleDragEnd = (event: DragEndEvent) => {
    if (!layout) return;
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Sidebar article / banner → slot
    if (
      (activeData?.type === "article" || activeData?.type === "banner") &&
      overData?.kind === "slot"
    ) {
      const region = layout.layout.find((r) => r.id === overData.regionId);
      if (!region) return;
      const variant = slotVariantAt(region.template, overData.slotIndex);
      if (!variant) return;

      const expectsBanner = slotAcceptsBanner(variant);
      const droppedBanner = activeData.type === "banner";

      // Refuse mismatched payloads (e.g. dropping an article into a banner slot).
      if (expectsBanner !== droppedBanner) return;

      if (droppedBanner) {
        const banner: BannerBlock = {
          type: "banner",
          mediaId: activeData.bannerData?.mediaId,
          imageUrl: activeData.bannerData.imageUrl,
          linkUrl: activeData.bannerData.linkUrl ?? "",
          altText: activeData.bannerData.altText ?? "",
          openInNewTab: Boolean(activeData.bannerData.openInNewTab),
        };
        setSlotBlock(overData.regionId, overData.slotIndex, banner);
      } else {
        const article: ArticleBlock = {
          type: "article",
          articleId: activeData.articleId,
          snapshot: activeData.snapshot,
        };
        setSlotBlock(overData.regionId, overData.slotIndex, article);
      }
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

      // Don't allow swapping if it would mix banner and article slots between
      // regions whose variants don't match (e.g. moving a banner into a card slot).
      const fromRegion = layout.layout.find((r) => r.id === activeData.regionId);
      const toRegion = layout.layout.find((r) => r.id === overData.regionId);
      if (!fromRegion || !toRegion) return;
      const fromVariant = slotVariantAt(fromRegion.template, activeData.slotIndex);
      const toVariant = slotVariantAt(toRegion.template, overData.slotIndex);
      if (!fromVariant || !toVariant) return;
      if (slotAcceptsBanner(fromVariant) !== slotAcceptsBanner(toVariant)) return;

      swapSlots(
        activeData.regionId,
        activeData.slotIndex,
        overData.regionId,
        overData.slotIndex,
      );
      return;
    }

    // Region reorder (no kind on active or over → it's a region drag)
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
