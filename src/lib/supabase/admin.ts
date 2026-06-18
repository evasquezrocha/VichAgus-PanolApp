import "server-only";

import type { Database } from "@/types/database";
import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv, getSupabasePublicConfig } from "../env";

export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicConfig();
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
