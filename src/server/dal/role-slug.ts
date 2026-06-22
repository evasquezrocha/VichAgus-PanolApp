import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

type RoleSlugScope = {
  companyId: string | null;
  baseName: string;
};

export async function generateUniqueRoleSlug({
  companyId,
  baseName,
}: RoleSlugScope) {
  const supabase = await createServerSupabaseClient();
  const baseSlug = slugify(baseName) || "rol";

  let query = supabase.from("app_roles").select("slug");

  if (companyId === null) {
    query = query.is("company_id", null);
  } else {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const existingSlugs = new Set((data ?? []).map((role) => role.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}
