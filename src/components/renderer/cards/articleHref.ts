import type { ArticleBlock } from "../../../types/layout";

// Default URL builder used by every article card in the preview. When porting
// to the NextJS app, swap this for the production route pattern (e.g.
// `/articulo/${slug}` or whatever the app router exposes) and switch the
// <a> for `next/link`.
export function articleHref(snapshot: ArticleBlock["snapshot"]): string {
  return `https://prensaobrera.com/${snapshot.slug}`;
}
