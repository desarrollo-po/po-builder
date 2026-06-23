# PO Builder

A page builder for composing the "Home" page of prensaobrera.com. Built with React 18, Vite, TypeScript, and Tailwind CSS.

**Status**: ✅ Phases 1-2 Complete | 🔧 Phases 3-4 Ready | 📋 Phase 5 Ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase project (free tier OK)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_GRAPHQL_ENDPOINT=https://admin.prensaobrera.com/graphql
```

### Run

```bash
# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:5173` in your browser.

---

## 📋 Features

### ✅ Implemented

- [x] **Region Management** - Add/delete/edit/reorder regions
- [x] **State Management** - Zustand store with undo/redo (20 steps)
- [x] **Drag & Drop** - @dnd-kit with 3 scenarios (sidebar→canvas, reorder, move)
- [x] **Persistence** - Supabase with version tracking & publishing
- [x] **Components** - Sidebar (articles/banners), toolbar, canvas with regions

### ⏳ In Progress

- [ ] GraphQL integration (schema validation needed)
- [ ] Article drag testing
- [ ] Banner drag testing

### 🔮 Future

- [ ] Preview modal
- [ ] Version history dropdown
- [ ] Next.js consumer integration

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Installation guide
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Next steps
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Architecture
- **[REMAINING_WORK.md](REMAINING_WORK.md)** - Exact tasks for phases 3-5

---

## 🧪 Quick Test

```bash
npm run dev

# Test: Add region → Save → Reload → Should persist
1. Click "+ Add Region"
2. Select type and enter label
3. Click "Save"
4. Reload page
5. Region should still appear
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand (no Redux) |
| DnD | @dnd-kit |
| Backend | Supabase PostgreSQL |
| GraphQL | Fetch API (simple) |

---

## 📦 Project Stats

- **Components**: 18 implemented, 5 remaining
- **Lines of Code**: ~2000 (core logic)
- **Build Size**: 424.82 kB JS (123 kB gzipped)
- **TypeScript**: ✅ Full coverage, strict mode
- **Tests**: ✅ Builds successfully
- **Ready for**: Phase 3 (GraphQL validation)

---

## 🔗 Integration Examples

### Supabase Setup
```bash
# Run this in Supabase SQL Editor:
# Copy contents of migrations/001_create_page_layouts.sql
```

### GraphQL Query (Template)
```graphql
query SearchArticles($query: String!, $offset: Int!, $limit: Int!) {
  articles(search: $query, offset: $offset, limit: $limit) {
    items {
      id, title, excerpt, slug, imageUrl,
      publishedAt, category { name }, author { name }
    }
    total
  }
}
```

### Next.js Consumer
```tsx
const { data } = await supabase
  .from('page_layouts')
  .select('layout')
  .eq('slug', 'home')
  .eq('is_published', true)
  .single();

return data.layout.regions.map(region => <RegionRenderer region={region} />);
```

---

## ⏱️ Timeline

| Phase | Status | Time | Work |
|-------|--------|------|------|
| 1: Scaffold | ✅ | 3h | Vite + Types + Supabase client |
| 2: Regions | ✅ | 4h | Canvas + Region CRUD + Zustand |
| 3: GraphQL | ⏳ | 4h | Article search + drag testing |
| 4: Polish | ⏳ | 6h | Error handling + loading states |
| 5: Preview | 📋 | 5h | Preview modal + publish flow |

---

## 🎯 Next Steps

1. Get GraphQL schema from prensaobrera.com
2. Update query in `src/lib/graphql.ts`
3. Test article search: `npm run dev`
4. Test all drag scenarios
5. Create preview modal
6. Deploy!

See [REMAINING_WORK.md](REMAINING_WORK.md) for detailed checklist.

---

**Ready for**: GraphQL integration + testing
**Last Updated**: March 15, 2026
