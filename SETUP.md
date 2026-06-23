# PO Builder Setup Guide

## Prerequisites

- Node.js 18+
- Supabase project
- GraphQL endpoint for prensaobrera.com

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GRAPHQL_ENDPOINT=https://admin.prensaobrera.com/graphql
```

## Supabase Setup

1. Go to your Supabase project SQL Editor
2. Run the migration in `migrations/001_create_page_layouts.sql`
3. This creates the `page_layouts` table with RLS policies

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Implementation Status

### Phase 1: ✅ Scaffold + Supabase Foundation
- Vite + React + TypeScript + Tailwind setup
- Types defined in `src/types/layout.ts`
- Supabase client with loadLayout/saveLayout helpers
- Basic App.tsx with two-column layout (sidebar + canvas)

### Phase 2: ✅ Canvas + Gestión de Regiones
- Zustand store for layout state management
- Canvas renders regions with drag support
- Add/delete/edit region labels
- Save button with dirty indicator

### Phase 3: ⏳ Sidebar de Artículos + Drag Escenario A
- ArticleBrowser with search (requires valid GraphQL endpoint)
- Draggable ArticleCard from sidebar to canvas
- Scenario A drag (article to region) functional

### Phase 4: ⏳ Banners + Reordenamiento + Undo
- BannerForm in sidebar (ready)
- Scenario B & C drag handlers (ready)
- Undo/redo with 20-step history
- Region reordering support

### Phase 5: ⏳ Preview + Publicar + Polish
- Save/Publish in BuilderToolbar
- Full end-to-end flow
- Next.js consumer integration

## Architecture

```
src/
├── types/          # Type definitions (layout, blocks, etc)
├── lib/            # Supabase and GraphQL clients
├── store/          # Zustand state (layoutStore)
├── hooks/          # useDragHandlers
├── components/
│   ├── builder/    # Canvas, regions, blocks
│   ├── sidebar/    # Article browser, banner form
│   └── blocks/     # Article and banner block views
└── App.tsx         # Main layout
```

## Data Model

### PageLayout
```ts
{
  id: string;
  slug: string;           // e.g. "home"
  version: number;        // Auto-incremented on save
  layout: Region[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
```

### Region
```ts
{
  id: string;
  type: "hero" | "grid" | "sidebar" | "banner-row";
  label: string;
  order: number;
  blocks: Block[];
  config: { columns?: number; maxBlocks?: number; bgColor?: string };
}
```

### Block (Article or Banner)
```ts
// ArticleBlock
{
  type: "article";
  articleId: string;
  snapshot: { title, excerpt, imageUrl, ... };
}

// BannerBlock
{
  type: "banner";
  imageUrl: string;
  linkUrl: string;
  altText: string;
  openInNewTab: boolean;
}
```

## Drag & Drop Scenarios

**Scenario A**: Sidebar (article/banner) → Canvas region
- Handled by `useDragHandlers.ts`
- Creates new block with snapshot data

**Scenario B**: Reorder blocks within region
- Sortable context on RegionBlockList
- Updates block order in layout

**Scenario C**: Move block between regions
- Detects source and dest regions
- Removes from source, adds to destination

## Next.js Consumer Example

```tsx
// app/page.tsx
export default async function HomePage() {
  const { data } = await supabase
    .from("page_layouts")
    .select("layout")
    .eq("slug", "home")
    .eq("is_published", true)
    .single();

  return (
    <main>
      {data.layout.regions.map(region => (
        <RegionRenderer key={region.id} region={region} />
      ))}
    </main>
  );
}
```

## Known Limitations

- No image upload (requires Supabase Storage integration)
- GraphQL schema must match expected fields
- CORS issues require vite proxy or Supabase Edge Functions
- Max 20 undo steps (configurable in layoutStore)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anonymous key | `eyJhb...` |
| `VITE_GRAPHQL_ENDPOINT` | GraphQL endpoint | `https://admin.prensaobrera.com/graphql` |
