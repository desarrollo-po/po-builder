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

export async function loadLayout(slug: string): Promise<PageLayout | null> {
  const { data, error } = await supabase
    .from("page_layouts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", false)
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
