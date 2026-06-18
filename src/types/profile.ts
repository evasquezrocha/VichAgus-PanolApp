import type { AppRole } from "./roles";
import type { AppPermission } from "./permission";

export type Profile = {
  id: string;
  company_id: string | null;
  role_id: string | null;
  full_name: string | null;
  email: string;
  role: AppRole | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileListItem = Profile & {
  company_name: string | null;
  role_name: string | null;
  permissions: AppPermission[];
};

export type CompanyProfileListItem = Profile & {
  company_name: string;
  role_name: string | null;
  permissions: AppPermission[];
};
