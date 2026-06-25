import type { ArticleBlock } from "../types/layout";

type Snapshot = ArticleBlock["snapshot"];

// Pick the WP size by name, falling back through the chain, then to the full
// `imageUrl`. Cards declare the size they want; old snapshots without
// `imageSizes` still render via the fallback.
export function pickImage(
  snapshot: Snapshot,
  ...preferred: string[]
): string {
  const sizes = snapshot.imageSizes;
  if (sizes) {
    for (const name of preferred) {
      if (sizes[name]) return sizes[name];
    }
  }
  return snapshot.imageUrl ?? "";
}

// WPGraphQL `mediaDetails.sizes` → Record<name, sourceUrl>. Null if no sizes.
export function sizesFromMediaDetails(
  sizes: Array<{ name: string | null; sourceUrl: string | null }> | null | undefined,
): Record<string, string> | null {
  if (!sizes?.length) return null;
  const out: Record<string, string> = {};
  for (const s of sizes) {
    if (s.name && s.sourceUrl) out[s.name] = s.sourceUrl;
  }
  return Object.keys(out).length ? out : null;
}
