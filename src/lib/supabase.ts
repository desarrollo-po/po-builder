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

  return { success: true };
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
