import type { PageLayout } from "../../types/layout";
import RegionRenderer from "./RegionRenderer";

interface Props {
  layout: PageLayout;
}

// Page-level entry point. The shape consumed here is exactly what Supabase
// returns from `loadLayout` / `loadPublishedLayout`, so the NextJS frontend
// can reuse this same component (or a port of it) by passing the same JSON.
//
// Regions are rendered in `order` to match how the editor arranged them.
// The store already keeps `layout.layout` in `order`, so a fresh sort here
// is defensive — it costs nothing and survives any JSON that didn't go
// through the store (e.g. a manual fetch from Supabase).
export default function PageRenderer({ layout }: Props) {
  const regions = [...layout.layout].sort((a, b) => a.order - b.order);

  return (
    <main
      className="@container"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {regions.map((region) => (
        <RegionRenderer key={region.id} region={region} />
      ))}
    </main>
  );
}
