# Content Source Seam

Unificación del sidebar alrededor de un contrato único (`ContentSource`) que permite enchufar N orígenes de datos (artículos PO, artículos EDM, banners de WP media, etc.) sin tocar la UI ni el Sidebar.

## Motivación

El Sidebar tenía dos componentes hermanos (`ArticleBrowser` y `BannerLibrary`) que duplicaban:

- input con debounce,
- `useInfiniteQuery` + paginación cursor-based,
- estados loading / empty / error,
- botón "Cargar más".

Cada nuevo origen requería copiar todo eso y agregar una nueva tab a mano en `Sidebar.tsx`. Además, al introducir el adaptador de **revistaedm.com** quedaba claro que los orígenes iban a multiplicarse, y los hooks legacy (`useArticles`, `useMedia`) seguían apuntando a símbolos que ya no existían en `lib/graphql.ts`.

La solución es un **seam** en `src/sources/`: un contrato que cada origen implementa, y un browser genérico que lo consume.

## Contrato

`src/sources/types.ts`

```ts
export interface ContentSource<TItem> {
  id: string;                                 // react-query key + tab id
  label: string;                              // texto de la tab
  searchPlaceholder?: string;
  defaultPageSize?: number;
  layout?: "list" | "grid";                   // disposición de items
  fetchPage: (
    query: string,
    after: string | null,
    first: number,
    signal?: AbortSignal,
  ) => Promise<ContentPage<TItem>>;
  ItemCard: ComponentType<{ item: TItem }>;   // dueño de su useDraggable
  getItemKey: (item: TItem) => string;        // key estable para React
  emptyMessage?: string;
}
```

Cada origen es responsable de:

- conocer su endpoint y su query GraphQL,
- mapear el nodo crudo a la forma que su `ItemCard` consume,
- producir el **drag payload** correcto (`type: "article"` o `type: "banner"`).

El Sidebar no sabe nada de eso.

## Orígenes registrados

`src/sources/index.ts`

```ts
export const sources: ContentSource<unknown>[] = [
  poArticles  as ContentSource<unknown>,   // prensaobrera.com WPGraphQL
  edmArticles as ContentSource<unknown>,   // revistaedm.com WPGraphQL (cat. "EDM Digital")
  bannerMedia as ContentSource<unknown>,   // WP mediaItems filtrado por "banner"
];
```

Agregar un nuevo origen = crear un archivo en `src/sources/` que exporte un `ContentSource<TItem>` y appendearlo a este array. No hace falta tocar Sidebar ni SourceBrowser.

## SourceBrowser

`src/components/sidebar/SourceBrowser.tsx` es el único browser. Es genérico sobre `TItem`, recibe `source: ContentSource<TItem>` y maneja:

- input con debounce de 300 ms,
- `useInfiniteQuery` con `queryKey: [source.id, debouncedQuery]`,
- página de búsqueda más grande que la de listado (`searchPageSize = max(pageSize, 20)`),
- layout `list` (columna vertical) o `grid` (2 columnas) según `source.layout`,
- empty state con copy desde `source.emptyMessage`,
- reset del input al cambiar de source (vía `useEffect([source.id])`).

El Sidebar lo monta con `key={activeSource.id}` para forzar remontaje al cambiar de tab y que `useInfiniteQuery` no acarree páginas de la tab anterior.

## Drag contract preservado

Los datos `useDraggable` siguen idénticos:

- artículos: `{ type: "article", articleId, snapshot }`
- banners: `{ type: "banner", mediaId, bannerData: { mediaId, imageUrl, altText, linkUrl, openInNewTab } }`

`useDragHandlers.ts` y los slots no necesitaron cambios.

## Cambios concretos

**Agregado**
- `src/sources/banner-media.tsx` — adaptador de WP media filtrado server-side por `"banner"`; type `MediaItem` vive acá.
- `src/sources/index.ts` — registro de sources.
- `src/components/sidebar/SourceBrowser.tsx` — browser genérico.

**Modificado**
- `src/sources/types.ts` — agregados `layout`, `getItemKey`, `emptyMessage`.
- `src/sources/po-articles.tsx` — completa los campos nuevos.
- `src/sources/edm-articles.tsx` — completa los campos nuevos; label `"EDM"` (más corta para que entren 3 tabs en 400 px).
- `src/components/sidebar/Sidebar.tsx` — tabs derivadas del array `sources`; ya no hay enum hardcodeado.
- `src/components/sidebar/BannerMediaCard.tsx` — import de `MediaItem` apunta a `sources/banner-media`.

**Borrado**
- `src/components/sidebar/ArticleBrowser.tsx`
- `src/components/sidebar/BannerLibrary.tsx`
- `src/hooks/useArticles.ts`
- `src/hooks/useMedia.ts`

## Cómo agregar un nuevo origen

1. Crear `src/sources/<nombre>.tsx`.
2. Definir el item shape (`<Nombre>Item`) y la query GraphQL.
3. Implementar `fetchPage(query, after, first, signal)` devolviendo `ContentPage<TItem>`.
4. Implementar `ItemCard({ item })` — interno o delegando a una card compartida (`ArticleCard`, etc.). La card es responsable de su `useDraggable` y de armar el drag payload con el `type` correcto.
5. Exportar el `ContentSource<TItem>` con todos los campos.
6. Appendear al array de `src/sources/index.ts`.

Para que `useDragHandlers` lo acepte como artículo el payload debe ser `{ type: "article", articleId, snapshot }`. Para banner, `{ type: "banner", bannerData: {...} }`. Otros `type` requieren extender `useDragHandlers`.

## Variables de entorno relevantes

```
VITE_GRAPHQL_ENDPOINT        # prensaobrera.com — usado por poArticles y bannerMedia
VITE_GRAPHQL_ENDPOINT_EDM    # revistaedm.com   — usado por edmArticles
```

Si `VITE_GRAPHQL_ENDPOINT_EDM` no está seteado, `edmArticles.fetchPage` devuelve resultados vacíos con un warning en consola.
