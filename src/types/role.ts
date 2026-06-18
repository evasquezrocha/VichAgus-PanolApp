import type { AppPermission } from "./permission";

export type AppRoleDefinition = {
  id: string;
  company_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  permissions: AppPermission[];
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
