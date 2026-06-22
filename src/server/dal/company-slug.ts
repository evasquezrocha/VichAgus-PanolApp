import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function generateUniqueCompanySlug(baseName: string) {
  const supabase = await createServerSupabaseClient();
  const baseSlug = slugify(baseName) || "empresa";

  const { data, error } = await supabase.from("companies").select("slug");

  if (error) {
    throw new Error(error.message);
  }

  const existingSlugs = new Set((data ?? []).map((company) => company.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}
