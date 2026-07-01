import { createClient } from "@supabase/supabase-js";
import type { PageLayout } from "../types/layout";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: import.meta.env.DEV
        ? `${window.location.origin}${import.meta.env.BASE_URL}`
        : "https://desarrollo-po.github.io/po-builder/",
    },
  });
}

export async function signOutAll() {
  await supabase.auth.signOut();
}

export async function isEmailAllowed(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("allowed_users")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    console.error("Error checking allowlist:", error);
    return false;
  }
  return !!data;
}

export async function loadLayout(slug: string): Promise<PageLayout | null> {
  // Most-recent row for the slug regardless of publish state. A page that was
  // published with no later draft still needs to load into the editor.
  const { data, error } = await supabase
    .from("page_layouts")
    .select("*")
    .eq("slug", slug)
    .order("version", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error loading layout:", error);
    return null;
  }

  return data || null;
}

export async function saveLayout(
  layout: PageLayout
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase
    .from("page_layouts")
    .insert([
      {
        slug: layout.slug,
        title: layout.title,
        tag_slug: layout.tag_slug,
        version: layout.version,
        layout: layout.layout,
        is_published: false,
        meta_description: layout.meta_description ?? null,
        og_image_url: layout.og_image_url ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Error saving layout:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
}

export interface PageSummary {
  slug: string;
  title: string | null;
  tag_slug: string | null;
  is_published: boolean;
  updated_at: string;
}

// Latest row per slug. PostgREST has no DISTINCT ON, so fetch and dedupe
// client-side. Fine while pages are in the tens — revisit at hundreds.
// ponytail: client dedupe; switch to an RPC with DISTINCT ON if it gets slow.
export async function listPages(): Promise<PageSummary[]> {
  const { data, error } = await supabase
    .from("page_layouts")
    .select("slug, title, tag_slug, is_published, updated_at")
    .order("slug", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing pages:", error);
    return [];
  }

  const seen = new Set<string>();
  const published = new Set<string>();
  const rows: PageSummary[] = [];
  for (const row of data ?? []) {
    if (row.is_published) published.add(row.slug);
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    rows.push(row as PageSummary);
  }
  // The first row per slug (most recent) may be a draft; reflect that a
  // published version exists somewhere for the slug.
  return rows.map((r) => ({ ...r, is_published: published.has(r.slug) }));
}

export async function createPage(input: {
  slug: string;
  title: string;
  tag_slug: string | null;
}): Promise<{ success: boolean; error?: string }> {
  // ponytail: client validates slug uniqueness; race with a concurrent
  // editor naming the same slug is accepted. Add a unique(slug) constraint
  // on a dedicated `pages` table if multi-editor collisions actually happen.
  const { error } = await supabase.from("page_layouts").insert([
    {
      slug: input.slug,
      title: input.title,
      tag_slug: input.tag_slug,
      version: 1,
      layout: [],
      is_published: false,
    },
  ]);

  if (error) {
    console.error("Error creating page:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

async function revalidatePage(slug: string): Promise<void> {
  const url = import.meta.env.VITE_REVALIDATE_URL;
  const secret = import.meta.env.VITE_REVALIDATE_SECRET;
  if (!url || !secret) return;
  const res = await fetch(
    `${url}/api/revalidate-page?secret=${encodeURIComponent(secret)}&slug=${encodeURIComponent(slug)}`
  );
  console.log("🔍 ~ revalidatePage ~ src/lib/supabase.ts:161 ~ res:", res);
  if (!res.ok) throw new Error(`Revalidation webhook returned ${res.status}`);
}

export async function publishLayout(
  slug: string,
  version: number
): Promise<{ success: boolean; error?: string }> {
  // First, unpublish any currently published version
  await supabase
    .from("page_layouts")
    .update({ is_published: false, published_at: null })
    .eq("slug", slug)
    .eq("is_published", true);

  // Then publish the specified version
  const { error } = await supabase
    .from("page_layouts")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .eq("version", version);

  if (error) {
    console.error("Error publishing layout:", error);
    return { success: false, error: error.message };
  }

  // ponytail: fire-and-forget; DB publish already committed, don't block on webhook
  revalidatePage(slug).catch((e) => console.warn("Revalidation webhook failed:", e));

  return { success: true };
}

// --- Page locks ---

const LOCK_TTL_MS = 5 * 60 * 1000;
const lockExpiry = () => new Date(Date.now() - LOCK_TTL_MS).toISOString();

export type PageLock = { slug: string; locked_by: string };

export async function acquireLock(
  slug: string,
  email: string,
  force = false
): Promise<{ ok: boolean; lockedBy?: string }> {
  if (!force) {
    const { data } = await supabase
      .from("page_locks")
      .select("locked_by")
      .eq("slug", slug)
      .neq("locked_by", email)
      .gt("locked_at", lockExpiry())
      .maybeSingle();
    if (data) return { ok: false, lockedBy: data.locked_by };
  }
  await supabase
    .from("page_locks")
    .upsert({ slug, locked_by: email, locked_at: new Date().toISOString() });
  return { ok: true };
}

export async function releaseLock(slug: string, email: string): Promise<void> {
  await supabase.from("page_locks").delete().eq("slug", slug).eq("locked_by", email);
}

export async function refreshLock(slug: string, email: string): Promise<void> {
  await supabase
    .from("page_locks")
    .update({ locked_at: new Date().toISOString() })
    .eq("slug", slug)
    .eq("locked_by", email);
}

export async function checkLock(slug: string): Promise<PageLock | null> {
  const { data } = await supabase
    .from("page_locks")
    .select("slug, locked_by")
    .eq("slug", slug)
    .gt("locked_at", lockExpiry())
    .maybeSingle();
  return (data as PageLock | null) ?? null;
}

export async function getLocks(): Promise<PageLock[]> {
  const { data } = await supabase
    .from("page_locks")
    .select("slug, locked_by")
    .gt("locked_at", lockExpiry());
  return (data as PageLock[]) ?? [];
}

function resizeToWebP(file: File, maxWidth = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("toBlob failed")), "image/webp", 0.85);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function uploadOgImage(file: File, slug: string): Promise<string> {
  const blob = await resizeToWebP(file);
  const path = `${slug}/og.webp`;
  const { error } = await supabase.storage.from("og-images").upload(path, blob, { contentType: "image/webp", upsert: true });
  if (error) throw error;
  return supabase.storage.from("og-images").getPublicUrl(path).data.publicUrl;
}

export async function getLayoutVersions(
  slug: string
): Promise<
  Array<{ id: string; version: number; updated_at: string; is_published: boolean }>
> {
  const { data, error } = await supabase
    .from("page_layouts")
    .select("id, version, updated_at, is_published")
    .eq("slug", slug)
    .order("version", { ascending: false });

  if (error) {
    console.error("Error loading versions:", error);
    return [];
  }

  return data || [];
}
