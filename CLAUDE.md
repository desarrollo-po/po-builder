# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite, localhost:5173)
npm run build      # Type-check (tsc -b) then build
npm run lint       # ESLint
npm run preview    # Preview production build
```

## Workflow & Rules
**Always** bring context-7-mcp and ponytail skill. For each code change you must bring improve-codebase-architecture skill in order to keep architecture consistant and coherent.

## Architecture

**PO Builder** is an internal drag-and-drop page builder for prensaobrera.com's home page. Editors drag articles (fetched from a WordPress GraphQL API) and banners into configurable regions. The resulting layout JSON is saved to Supabase and consumed by the Next.js frontend.

### Data flow

```
WordPress GraphQL → ArticleBrowser → ArticleCard (draggable)
                                          ↓ drag
                    Canvas → RegionBlockList (droppable) → layoutStore → Supabase
```

### Styling

**IMPORTANT**: All components use **Tailwind**.

### State — `src/store/layoutStore.ts`

Single Zustand store. All mutations push a full layout snapshot to `history[]` (max 20 entries, supports undo/redo). The layout structure:

```
PageLayout
  └── layout: Region[]
        └── blocks: Block[]   (ArticleBlock | BannerBlock)
```

`addBlockToRegion(regionId, block, insertAtIndex?)` inserts at a specific position and re-numbers `order` on all blocks.

### Drag & Drop — `src/hooks/useDragHandlers.ts`

`DndContext` lives in `App.tsx` and must wrap both Sidebar and Canvas so cross-container drag works. Three scenarios handled in `handleDragEnd`:

- **Scenario A** — Sidebar article/banner → region drop zone. Detected by `activeData.type === "article"|"banner"` and `overData.regionId`. Insert index is computed by comparing `active.rect.current.translated` midpoint vs `over.rect` midpoint of the target block.
- **Scenario B** — Reorder blocks within a region. Both active and over have matching `regionId`.
- **Scenario C** — Move block between regions. Different source/dest `regionId`.
- **Region reorder** — Neither active nor over has `regionId`; guarded by checking `activeData.type` to prevent sidebar drags from triggering it.

### Drop indicator — `src/components/builder/RegionBlockList.tsx`

Uses `useDndContext().over` to detect hover over any block in the region (via `over.data.current.regionId === regionId`), not just the region container's empty space. The placeholder position (`insertAtIndex`) is computed from the same Y-midpoint logic as the handler so visual and actual insertion always match.

### Persistence — `src/lib/supabase.ts`

Each Save **inserts a new row** (version++), never overwrites. Publish sets `is_published = true` on the target version and clears it on all others for that slug. `loadLayout` fetches the most recent unpublished draft.

### GraphQL — `src/lib/graphql.ts`

Fetches from `VITE_GRAPHQL_ENDPOINT` (prensaobrera.com WPGraphQL). Uses **cursor-based pagination** (`after` / `endCursor`). Two separate query strings are used depending on whether a search term is present (avoids "variable declared but never used" GraphQL errors). Custom fields: `campos.descripcionDestacado` (excerpt), `campos.volanta`.

## Environment variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GRAPHQL_ENDPOINT=https://admin.prensaobrera.com/graphql
```
