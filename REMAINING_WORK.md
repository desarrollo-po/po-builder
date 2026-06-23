# Remaining Work - Detailed Checklist

## Overview
This document outlines the exact steps needed to complete Phases 3-5 of the PO Builder implementation.

---

## Phase 3: Complete GraphQL Integration

### 🎯 Goal
Integrate real article search from prensaobrera.com GraphQL API into the ArticleBrowser.

### ✅ What's Ready
- ArticleBrowser.tsx with search UI
- searchArticles() function template
- ArticleCard draggable component
- RegionBlockList droppable target

### 📋 Remaining Tasks

#### Task 1: Get GraphQL Schema (1 hour)
- [ ] Contact prensaobrera.com team
- [ ] Request GraphQL schema (query for articles)
- [ ] Expected fields: id, title, excerpt, slug, imageUrl, publishedAt, category, author
- [ ] Note pagination method (offset/limit vs cursor)

**Expected Response:**
```graphql
type Query {
  articles(search: String!, offset: Int, limit: Int): {
    items: [Article!]!
    total: Int!
  }
}

type Article {
  id: ID!
  title: String!
  excerpt: String!
  slug: String!
  imageUrl: String
  publishedAt: DateTime!
  category: { name: String }
  author: { name: String }
}
```

#### Task 2: Update GraphQL Query (30 mins)
**File**: `src/lib/graphql.ts`

```ts
// Replace this:
const graphqlQuery = `
  query SearchArticles($query: String!, $offset: Int!, $limit: Int!) {
    articles(search: $query, offset: $offset, limit: $limit) {
      items { /* fields */ }
      total
    }
  }
`;

// With actual schema from prensaobrera.com
// Adjust field names to match real API
```

**Checklist:**
- [ ] Update query variable names
- [ ] Update field names in response mapping
- [ ] Test with actual endpoint
- [ ] Handle CORS (add vite proxy or Edge Function)

#### Task 3: Add Vite Proxy for CORS (30 mins)
**File**: `vite.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/graphql': {
        target: 'https://prensaobrera.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/graphql/, '/graphql'),
      }
    }
  }
});
```

**Then update `.env`:**
```env
VITE_GRAPHQL_ENDPOINT=/graphql
```

**Checklist:**
- [ ] Add proxy configuration
- [ ] Test search with proxy
- [ ] Verify CORS errors disappear

#### Task 4: Test Article Search (1 hour)
```bash
npm run dev
# Open http://localhost:5173
# Sidebar → Articles tab
# Type in search box
# Should see articles appear
```

**Verification:**
- [ ] Type keyword → returns articles
- [ ] Load More works
- [ ] Pagination works correctly
- [ ] No CORS errors
- [ ] No GraphQL errors

#### Task 5: Test Dragging Article to Canvas (30 mins)
```bash
# In dev server from above:
# Sidebar → Articles tab
# Search for an article
# Drag article card to canvas region
# Article should appear as a block
```

**Verification:**
- [ ] Drag visual feedback works
- [ ] ArticleBlock appears in region
- [ ] Block contains correct snapshot data
- [ ] Can delete block
- [ ] Can drag another article

---

## Phase 4: Complete Testing & Polish

### 🎯 Goal
Test all drag scenarios and add error handling.

### ✅ What's Ready
- All drag handlers implemented
- Undo/redo working
- Save button implemented

### 📋 Remaining Tasks

#### Task 1: Test Scenario B - Reorder Blocks (1 hour)

**Setup:**
1. Add 3+ articles to same region
2. Each should appear as a BlockItem

**Tests:**
- [ ] Drag block down → order changes
- [ ] Drag block to different position → reorders
- [ ] Undo reorder → returns to original order
- [ ] Save → persists new order

**Expected Behavior:**
```
Before:  Article 1 > Article 2 > Article 3
Drag 1 down...
After:   Article 2 > Article 1 > Article 3
```

#### Task 2: Test Scenario C - Move Block Between Regions (1 hour)

**Setup:**
1. Create 2+ regions
2. Add articles to region A
3. Try to move to region B

**Tests:**
- [ ] Drag block to another region → moves
- [ ] Block removed from source, added to dest
- [ ] Undo move → returns to source
- [ ] Save → persists move

**Expected Behavior:**
```
Region A: [Article 1] [Article 2]
Region B: [empty]

Drag Article 1 to Region B...

Region A: [Article 2]
Region B: [Article 1]
```

#### Task 3: Test Banner Drag (1 hour)

**Setup:**
1. Go to Sidebar → Banners tab
2. Fill in banner form:
   - Image URL: any valid image URL
   - Link URL: https://example.com
   - Alt Text: some description
3. Drag to region

**Tests:**
- [ ] Banner drag enabled only when URL + link filled
- [ ] Visual feedback during drag
- [ ] BannerBlock appears in region
- [ ] Image preview shows
- [ ] Can link to external sites
- [ ] Can delete banner block

#### Task 4: Test Undo/Redo (30 mins)

**Setup:**
1. Perform multiple actions:
   - Add region
   - Add article to region
   - Delete article
   - Reorder regions

**Tests:**
- [ ] Undo button disabled at start
- [ ] Undo reverts each action
- [ ] Redo restores after undo
- [ ] Can't redo after new action
- [ ] 20-step limit (21st action loses oldest)
- [ ] Save clears dirty flag but keeps history

#### Task 5: Add Error Messages (1-2 hours)

**Error Cases to Handle:**

1. **GraphQL Errors**
```ts
// In searchArticles catch block:
if (error.includes("CORS")) {
  return "Cannot reach API (CORS). Check proxy settings.";
}
if (error.includes("401")) {
  return "API authentication failed";
}
return "Search failed. Try again later.";
```

2. **Supabase Errors**
```ts
// In saveLayout catch block:
if (error.code === "PGRST116") {
  return "Layout not found";
}
if (error.code === "42P01") {
  return "Table not found. Run database migration.";
}
return "Save failed: " + error.message;
```

3. **Validation Errors**
```ts
// BannerForm:
if (!imageUrl.match(/^https?:\/\//)) {
  return "Invalid image URL";
}
if (!linkUrl.match(/^https?:\/\//)) {
  return "Invalid link URL";
}
```

**Checklist:**
- [ ] Add try-catch around save
- [ ] Display error message to user
- [ ] Add error UI in ArticleBrowser
- [ ] Add validation errors in BannerForm

#### Task 6: Add Loading States (1 hour)

**Components needing loaders:**

1. **ArticleBrowser**
```tsx
{isLoading && (
  <div className="animate-pulse">
    <div className="h-20 bg-gray-200 rounded mb-2"></div>
    <div className="h-20 bg-gray-200 rounded mb-2"></div>
    <div className="h-20 bg-gray-200 rounded mb-2"></div>
  </div>
)}
```

2. **BuilderToolbar**
```tsx
<button disabled={isSaving}>
  {isSaving ? "Saving..." : "Save"}
</button>
```

**Checklist:**
- [ ] Search shows loading spinner
- [ ] Save shows "Saving..." text
- [ ] Publish shows "Publishing..." text
- [ ] Buttons disabled during operation

---

## Phase 5: Preview & Publishing

### 🎯 Goal
Add preview modal and test full publish flow.

### 🗂️ New Files Needed

#### 1. Create `src/components/preview/PreviewModal.tsx`

```tsx
import { useState } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import PreviewRegion from './PreviewRegion';

export default function PreviewModal() {
  const { layout } = useLayoutStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Preview
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
      <button
        onClick={() => setIsOpen(false)}
        className="fixed top-4 right-4 text-white text-2xl"
      >
        ✕
      </button>

      <div className="max-w-6xl mx-auto p-8">
        {layout?.layout.map(region => (
          <PreviewRegion key={region.id} region={region} />
        ))}
      </div>
    </div>
  );
}
```

#### 2. Create `src/components/preview/PreviewRegion.tsx`

```tsx
import type { Region } from '../../types/layout';
import PreviewBlock from './PreviewBlock';

export default function PreviewRegion({ region }: { region: Region }) {
  const getGridClass = () => {
    if (region.type === 'grid') {
      const cols = region.config.columns || 3;
      return `grid grid-cols-${cols} gap-4`;
    }
    return 'space-y-4';
  };

  return (
    <section className={`mb-12 ${getGridClass()}`}>
      {region.blocks.map(block => (
        <PreviewBlock key={block.id} block={block} />
      ))}
    </section>
  );
}
```

#### 3. Create `src/components/preview/PreviewBlock.tsx`

```tsx
import type { Block } from '../../types/layout';
import ArticleBlockView from '../blocks/ArticleBlockView';
import BannerBlockView from '../blocks/BannerBlockView';

export default function PreviewBlock({ block }: { block: Block }) {
  if (block.type === 'article') {
    return (
      <article className="bg-white p-4 rounded shadow">
        <ArticleBlockView block={block} />
      </article>
    );
  }

  if (block.type === 'banner') {
    return (
      <div className="bg-gray-100 p-4 rounded shadow">
        <BannerBlockView block={block} />
      </div>
    );
  }

  return null;
}
```

### 📋 Tasks

#### Task 1: Add Preview Button to Toolbar (30 mins)
**File**: `src/components/builder/BuilderToolbar.tsx`

```tsx
import PreviewModal from '../preview/PreviewModal';

export default function BuilderToolbar() {
  return (
    <div className="...">
      {/* existing buttons */}
      <PreviewModal />
    </div>
  );
}
```

**Checklist:**
- [ ] Preview button appears in toolbar
- [ ] Clicking opens modal
- [ ] Modal is fullscreen
- [ ] Close button works

#### Task 2: Create Preview Components (2 hours)
- [ ] Create `PreviewModal.tsx`
- [ ] Create `PreviewRegion.tsx`
- [ ] Create `PreviewBlock.tsx`
- [ ] Style components for production look
- [ ] Test layout preview

#### Task 3: Test Publish Flow (1 hour)

**Setup:**
1. Add region with articles
2. Save layout
3. Click Publish
4. Confirm dialog appears

**Tests:**
- [ ] Publish shows confirmation dialog
- [ ] Confirm → sets is_published
- [ ] Success message shows
- [ ] Can't undo publish (intentional)
- [ ] Old published version is unpublished

**Verify in Supabase:**
```sql
SELECT slug, version, is_published, published_at
FROM page_layouts
WHERE slug = 'home'
ORDER BY version DESC;

-- Should show only one row with is_published = true
```

#### Task 4: Test Next.js Consumer (1 hour)

**Setup in Next.js app (prensaobrera.com):**

```tsx
// app/page.tsx
import { createClient } from '@supabase/supabase-js';

export default async function HomePage() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data } = await supabase
    .from('page_layouts')
    .select('layout')
    .eq('slug', 'home')
    .eq('is_published', true)
    .single();

  return (
    <main>
      {data?.layout.regions.map(region => (
        <RegionRenderer key={region.id} region={region} />
      ))}
    </main>
  );
}
```

**Checklist:**
- [ ] Consumer can load published layout
- [ ] Layout renders correctly
- [ ] Images display
- [ ] Links work
- [ ] No edit UI visible (read-only)

#### Task 5: Version History Dropdown (1-2 hours)

**File**: `src/components/builder/BuilderToolbar.tsx`

```tsx
const [versions, setVersions] = useState([]);
const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

useEffect(() => {
  const load = async () => {
    const versions = await getLayoutVersions(layout!.slug);
    setVersions(versions);
  };
  load();
}, [layout?.slug]);

// Add dropdown:
<select
  value={selectedVersion || ''}
  onChange={(e) => {
    const version = parseInt(e.target.value);
    // Load version
  }}
>
  {versions.map(v => (
    <option key={v.id} value={v.version}>
      v{v.version} {v.is_published ? '(published)' : ''}
      {new Date(v.updated_at).toLocaleDateString()}
    </option>
  ))}
</select>
```

**Checklist:**
- [ ] Dropdown shows all versions
- [ ] Published version marked
- [ ] Can load previous version
- [ ] Timestamp displays
- [ ] Shows version number

---

## 🎬 Testing Sequence

**Recommended Order:**

1. **GraphQL Integration** (Phase 3)
   - Validate schema
   - Test article search
   - Test article drag

2. **Drag Scenarios** (Phase 4)
   - Test scenario B (reorder)
   - Test scenario C (move)
   - Test banner drag

3. **Polish** (Phase 4)
   - Add error messages
   - Add loading states
   - Test undo/redo

4. **Preview & Publish** (Phase 5)
   - Create preview components
   - Test publish flow
   - Test Next.js consumer
   - Add version history

---

## ⏱️ Time Estimates

| Task | Estimate | Owner |
|------|----------|-------|
| GraphQL Schema | 2-4h | PO team |
| GraphQL Integration | 2h | Dev |
| CORS Proxy | 1h | Dev |
| Article Search Test | 1h | QA |
| Scenario B Test | 1h | QA |
| Scenario C Test | 1h | QA |
| Banner Test | 1h | QA |
| Error Handling | 2h | Dev |
| Loading States | 1h | Dev |
| Preview Components | 2h | Dev |
| Publish Flow Test | 1h | QA |
| Next.js Integration | 2h | Dev |
| Version History | 1-2h | Dev |
| **Total** | **~21-25h** | |

---

## 🚀 Go-Live Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] GraphQL integration complete
- [ ] Error handling for all scenarios
- [ ] Loading states visible
- [ ] Preview working
- [ ] Publish flow tested
- [ ] Next.js consumer ready
- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] SSL certificate valid
- [ ] CORS headers configured
- [ ] Rate limiting configured
- [ ] Monitoring/logging set up
- [ ] User documentation written
- [ ] Admin training completed

---

## 📞 Questions?

Refer back to:
- `IMPLEMENTATION_GUIDE.md` - Detailed next steps
- `PROJECT_STATUS.md` - Progress tracking
- `IMPLEMENTATION_SUMMARY.md` - Architecture overview
