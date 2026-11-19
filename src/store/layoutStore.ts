import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  PageLayout,
  Region,
  Block,
  TemplateId,
} from "../types/layout";
import { TEMPLATE_SPECS } from "../types/layout";
import { saveLayout, publishLayout, loadLayout } from "../lib/supabase";

interface LayoutState {
  layout: PageLayout | null;
  isDirty: boolean;
  history: PageLayout[];
  historyIndex: number;
  slug: string;

  lastLocalSave: string | null;
  draftRestored: boolean;

  initializeLayout: (slug: string, existingLayout?: PageLayout | null) => void;
  setLayout: (layout: PageLayout) => void;
  addRegion: (template: TemplateId) => void;
  deleteRegion: (regionId: string) => void;
  reorderRegions: (newOrder: string[]) => void;

  setSlotBlock: (
    regionId: string,
    slotIndex: number,
    block: Block,
  ) => void;
  clearSlot: (regionId: string, slotIndex: number) => void;
  swapSlots: (
    fromRegionId: string,
    fromSlotIndex: number,
    toRegionId: string,
    toSlotIndex: number,
  ) => void;
  updateBannerLinkUrl: (
    regionId: string,
    slotIndex: number,
    linkUrl: string,
  ) => void;
  updateBannerImageMobile: (
    regionId: string,
    slotIndex: number,
    imageUrlMobile: string | null,
  ) => void;
  updateCodeHtml: (regionId: string, slotIndex: number, html: string) => void;
  setBannerHeight: (regionId: string, idx: 0 | 1, height: number) => void;
  setCodeColumns: (regionId: string, count: number) => void;
  removeCodeColumn: (regionId: string, slotIndex: number) => void;
  setCodeColumnWidths: (regionId: string, widths: number[]) => void;
  updateMetadata: (patch: Partial<Pick<PageLayout, "title" | "meta_description" | "og_image_url">>) => void;

  save: () => Promise<{ success: boolean; error?: string }>;
  publish: () => Promise<{ success: boolean; error?: string }>;
  discardLocalDraft: () => Promise<void>;
  acknowledgeDraftRestored: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 5;
const PERSIST_KEY = "po-builder:layout:current";

function createEmptyLayout(
  slug: string,
  title: string = slug,
  tag_slug: string | null = null,
): PageLayout {
  return {
    id: uuidv4(),
    slug,
    title,
    tag_slug,
    version: 1,
    layout: [],
    is_published: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function isValidTemplateLayout(layout: PageLayout | null): boolean {
  if (!layout) return false;
  if (!Array.isArray(layout.layout)) return false;
  return layout.layout.every(
    (r) =>
      typeof r === "object" &&
      r !== null &&
      typeof (r as Region).template === "string" &&
      (r as Region).template in TEMPLATE_SPECS &&
      Array.isArray((r as Region).blocks),
  );
}

function createRegion(template: TemplateId): Region {
  if (template === "code-region") {
    return {
      id: uuidv4(),
      template,
      order: 0,
      blocks: [null],
      codeColumns: 1,
    };
  }
  const spec = TEMPLATE_SPECS[template];
  return {
    id: uuidv4(),
    template,
    order: 0,
    blocks: Array.from({ length: spec.slotsCount }, () => null),
  };
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => {
      const commit = (updatedLayout: PageLayout) => {
        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(updatedLayout);
        if (newHistory.length > MAX_HISTORY) newHistory.shift();
        set({
          layout: updatedLayout,
          isDirty: true,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          lastLocalSave: new Date().toISOString(),
        });
      };

      const updateRegions = (mutator: (regions: Region[]) => Region[]) => {
        const state = get();
        if (!state.layout) return;
        const next = mutator(state.layout.layout).map((r, idx) => ({
          ...r,
          order: idx,
        }));
        commit({
          ...state.layout,
          layout: next,
          updated_at: new Date().toISOString(),
        });
      };

      return {
        layout: null,
        isDirty: false,
        history: [],
        historyIndex: -1,
        slug: "",
        lastLocalSave: null,
        draftRestored: false,

        initializeLayout: (slug, existingLayout) => {
          const state = get();
          const localValid =
            isValidTemplateLayout(state.layout) && state.slug === slug;
          const remoteValid = isValidTemplateLayout(existingLayout ?? null);

          if (!localValid) {
            const layout = remoteValid
              ? (existingLayout as PageLayout)
              : createEmptyLayout(slug);
            set({
              layout,
              slug,
              isDirty: false,
              history: [layout],
              historyIndex: 0,
              lastLocalSave: null,
              draftRestored: false,
            });
            return;
          }

          const local = state.layout as PageLayout;
          const localTs = state.lastLocalSave;
          const remoteTs = remoteValid
            ? (existingLayout as PageLayout).updated_at
            : null;
          const localIsNewer =
            state.isDirty &&
            !!localTs &&
            (!remoteTs || localTs > remoteTs);

          if (localIsNewer) {
            set({
              slug,
              history: [local],
              historyIndex: 0,
              draftRestored: true,
            });
            return;
          }

          const layout = remoteValid
            ? (existingLayout as PageLayout)
            : createEmptyLayout(slug);
          set({
            layout,
            slug,
            isDirty: false,
            history: [layout],
            historyIndex: 0,
            lastLocalSave: null,
            draftRestored: false,
          });
        },

        setLayout: (layout) =>
          set({
            layout,
            isDirty: true,
            lastLocalSave: new Date().toISOString(),
          }),

        addRegion: (template) =>
          updateRegions((regions) => [...regions, createRegion(template)]),

        deleteRegion: (regionId) =>
          updateRegions((regions) => regions.filter((r) => r.id !== regionId)),

        reorderRegions: (newOrder) =>
          updateRegions((regions) => {
            const map = new Map(regions.map((r) => [r.id, r]));
            const reordered = newOrder
              .map((id) => map.get(id))
              .filter((r): r is Region => Boolean(r));
            if (reordered.length !== regions.length) {
              console.warn(
                "reorderRegions: count mismatch, ignoring",
                reordered.length,
                "vs",
                regions.length,
              );
              return regions;
            }
            return reordered;
          }),

        setSlotBlock: (regionId, slotIndex, block) =>
          updateRegions((regions) =>
            regions.map((r) => {
              if (r.id !== regionId) return r;
              const maxSlots = TEMPLATE_SPECS[r.template]?.slotsCount ?? r.blocks.length;
              if (slotIndex < 0 || slotIndex >= maxSlots) return r;
              const blocks = [...r.blocks];
              while (blocks.length < maxSlots) blocks.push(null);
              blocks[slotIndex] = block;
              return { ...r, blocks };
            }),
          ),

        setBannerHeight: (regionId, idx, height) => {
          const clamped = Math.min(800, Math.max(80, height));
          updateRegions((regions) =>
            regions.map((r) => {
              if (r.id !== regionId) return r;
              const next: [number, number] = [...(r.bannerHeights ?? [200, 200])] as [number, number];
              next[idx] = clamped;
              return { ...r, bannerHeights: next };
            }),
          );
        },

        setCodeColumns: (regionId, count) => {
          const clamped = Math.min(4, Math.max(1, count));
          updateRegions((regions) =>
            regions.map((r) => {
              if (r.id !== regionId) return r;
              const blocks = [...r.blocks];
              while (blocks.length < clamped) blocks.push(null);
              blocks.length = clamped;
              return { ...r, blocks, codeColumns: clamped, codeColumnWidths: undefined };
            }),
          );
        },

        removeCodeColumn: (regionId, slotIndex) =>
          updateRegions((regions) =>
            regions.map((r) => {
              if (r.id !== regionId) return r;
              if (r.blocks.length <= 1) return r;
              const blocks = r.blocks.filter((_, i) => i !== slotIndex);
              return { ...r, blocks, codeColumns: blocks.length, codeColumnWidths: undefined };
            }),
          ),

        setCodeColumnWidths: (regionId, widths) =>
          updateRegions((regions) =>
            regions.map((r) => (r.id === regionId ? { ...r, codeColumnWidths: widths } : r)),
          ),

        updateMetadata: (patch) => {
          const state = get();
          if (!state.layout) return;
          commit({ ...state.layout, ...patch, updated_at: new Date().toISOString() });
        },

        updateBannerLinkUrl: (regionId, slotIndex, linkUrl) =>
          updateRegions((regions) =>
            regions.map((r) => {
              if (r.id !== regionId) return r;
              if (slotIndex < 0 || slotIndex >= r.blocks.length) return r;
              const current = r.blocks[slotIndex];
              if (!current || current.type !== "banner") return r;
              const blocks = [...r.blocks];
              blocks[slotIndex] = { ...current, linkUrl };
              return { ...r, blocks };
            }),
          ),

        updateBannerImageMobile: (regionId, slotIndex, imageUrlMobile) =>
          updateRegions((regions) =>
            regions.map((r) => {
              if (r.id !== regionId) return r;
              if (slotIndex < 0 || slotIndex >= r.blocks.length) return r;
              const current = r.blocks[slotIndex];
              if (!current || current.type !== "banner") return r;
              const blocks = [...r.blocks];
              blocks[slotIndex] = { ...current, imageUrlMobile: imageUrlMobile ?? undefined };
              return { ...r, blocks };
            }),
          ),

        updateCodeHtml: (regionId, slotIndex, html) =>
          updateRegions((regions) =>
            regions.map((r) => {
              if (r.id !== regionId) return r;
              if (slotIndex < 0 || slotIndex >= r.blocks.length) return r;
              const current = r.blocks[slotIndex];
              if (!current || current.type !== "code") return r;
              const blocks = [...r.blocks];
              blocks[slotIndex] = { ...current, html };
              return { ...r, blocks };
            }),
          ),

        clearSlot: (regionId, slotIndex) =>
          updateRegions((regions) =>
            regions.map((r) => {
              if (r.id !== regionId) return r;
              if (slotIndex < 0 || slotIndex >= r.blocks.length) return r;
              const blocks = [...r.blocks];
              blocks[slotIndex] = null;
              return { ...r, blocks };
            }),
          ),

        swapSlots: (fromRegionId, fromSlotIndex, toRegionId, toSlotIndex) =>
          updateRegions((regions) => {
            const from = regions.find((r) => r.id === fromRegionId);
            const to = regions.find((r) => r.id === toRegionId);
            if (!from || !to) return regions;
            if (
              fromSlotIndex < 0 ||
              fromSlotIndex >= from.blocks.length ||
              toSlotIndex < 0 ||
              toSlotIndex >= to.blocks.length
            )
              return regions;

            const fromBlock = from.blocks[fromSlotIndex];
            const toBlock = to.blocks[toSlotIndex];

            return regions.map((r) => {
              if (r.id === fromRegionId && r.id === toRegionId) {
                const blocks = [...r.blocks];
                blocks[fromSlotIndex] = toBlock;
                blocks[toSlotIndex] = fromBlock;
                return { ...r, blocks };
              }
              if (r.id === fromRegionId) {
                const blocks = [...r.blocks];
                blocks[fromSlotIndex] = toBlock;
                return { ...r, blocks };
              }
              if (r.id === toRegionId) {
                const blocks = [...r.blocks];
                blocks[toSlotIndex] = fromBlock;
                return { ...r, blocks };
              }
              return r;
            });
          }),

        save: async () => {
          const state = get();
          if (!state.layout) return { success: false, error: "No layout loaded" };
          try {
            const nextLayout: PageLayout = {
              ...state.layout,
              updated_at: new Date().toISOString(),
              is_published: false,
            };
            const result = await saveLayout(nextLayout);
            if (result.success && result.version !== undefined) {
              nextLayout.version = result.version;
              set({
                layout: nextLayout,
                isDirty: false,
                lastLocalSave: null,
                draftRestored: false,
              });
            }
            return result;
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },

        publish: async () => {
          const state = get();
          if (!state.layout) return { success: false, error: "No layout loaded" };

          const incomplete = state.layout.layout.filter((r) => {
            const spec = TEMPLATE_SPECS[r.template];
            return r.blocks.some(
              (b) =>
                (!spec.optionalSlots && b === null) ||
                (b?.type === "banner" && (!b.imageUrl || !b.linkUrl.trim())),
            );
          });
          if (incomplete.length > 0) {
            const names = incomplete
              .map((r) => TEMPLATE_SPECS[r.template].label)
              .join(", ");
            return {
              success: false,
              error: `No se puede publicar: hay regiones incompletas (${names}). Los banners requieren URL de destino.`,
            };
          }

          try {
            const result = await publishLayout(state.layout.slug, state.layout.version);
            if (result.success) {
              set({
                layout: { ...state.layout, is_published: true, published_at: new Date().toISOString() },
              });
            }
            return result;
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },

        discardLocalDraft: async () => {
          const state = get();
          const slug = state.slug;
          if (!slug) return;
          const remote = await loadLayout(slug);
          const layout = isValidTemplateLayout(remote)
            ? (remote as PageLayout)
            : createEmptyLayout(slug);
          set({
            layout,
            slug,
            isDirty: false,
            history: [layout],
            historyIndex: 0,
            lastLocalSave: null,
            draftRestored: false,
          });
        },

        acknowledgeDraftRestored: () => set({ draftRestored: false }),

        undo: () => {
          const state = get();
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            set({
              layout: state.history[newIndex],
              historyIndex: newIndex,
              isDirty: true,
              lastLocalSave: new Date().toISOString(),
            });
          }
        },

        redo: () => {
          const state = get();
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            set({
              layout: state.history[newIndex],
              historyIndex: newIndex,
              isDirty: true,
              lastLocalSave: new Date().toISOString(),
            });
          }
        },

        canUndo: () => get().historyIndex > 0,
        canRedo: () => {
          const state = get();
          return state.historyIndex < state.history.length - 1;
        },
      };
    },
    {
      name: PERSIST_KEY,
      version: 1,
      partialize: (state) => ({
        layout: state.layout,
        slug: state.slug,
        isDirty: state.isDirty,
        lastLocalSave: state.lastLocalSave,
      }),
    },
  ),
);