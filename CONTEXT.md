# PO Builder — Domain Language

Glosario de términos del builder. La idea es mantenerlo corto: cada término que aparece en
discusiones de arquitectura o en nombres de tipos vive acá.

## Conceptos del builder

- **PageLayout** — la página entera, identificada por slug. Una versión publicada por slug
  como mucho.
- **Region** — bloque horizontal de la página, identificado por su `template`. Su layout y
  cantidad de slots están fijados por el `TemplateSpec`.
- **Slot** — celda de una región, identificada por su índice. Tipada por `SlotVariant`.
- **TemplateSpec** — definición declarativa de una región: grid CSS, cantidad y variantes
  de slots, thumbnail. Vive en `src/types/layout.ts → TEMPLATE_SPECS`.
- **SlotVariant** — clase visual de un slot (`hero`, `main-left`, `main-right`,
  `secondary-photo`, `secondary-small`, `secondary-text`, `banner`). El consumidor en
  producción decide qué componente de card renderizar según esta variante.
- **Block** — contenido que ocupa un slot. Hoy: `ArticleBlock | BannerBlock`. Un slot
  vacío es `null`.
- **ArticleSnapshot** — copia inmutable de los datos de un artículo en el momento de la
  inserción al layout. Sobrevive aunque el artículo cambie en la fuente original. Es el
  contrato de datos entre fuentes y builder.

## Sidebar y fuentes de contenido

- **ContentSource** — un módulo deep que provee items para arrastrar al canvas. Cada
  fuente declara su `id`, `label`, una función `fetchPage` paginada, y un `ItemCard` que
  sabe renderizarse y declarar su propio drag payload. PO artículos, EDM artículos y
  banners (media library de WP) son todos `ContentSource`s. El registry de sources vive
  en `src/sources/index.ts`; agregar fuente n+1 = un archivo nuevo + una línea en el
  registry, sin tocar `Sidebar` ni el store.
- **Adapter** — implementación concreta de un `ContentSource` para una fuente puntual
  (e.g. `src/sources/po-articles.ts`). Contiene la query GraphQL específica, el endpoint
  y el mapeo `node → snapshot`.
- **ContentBrowser** — el componente genérico del sidebar que consume cualquier
  `ContentSource`. Encapsula el input de búsqueda con debounce, el `useInfiniteQuery` y
  el listado paginado. No sabe de qué fuente viene cada item.
