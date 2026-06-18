import type { AppPermission } from "./permission";
import type { Profile } from "./profile";

export type CurrentProfile = Pick<
  Profile,
  "id" | "company_id" | "role_id" | "email" | "full_name" | "role" | "is_active"
> & {
  company_name: string | null;
  company_rut: string | null;
  company_logo_url: string | null;
  company_sidebar_bg_color: string | null;
  company_sidebar_text_color: string | null;
  company_sidebar_active_bg_color: string | null;
  company_sidebar_active_text_color: string | null;
  company_platform_background_color: string | null;
  role_name: string | null;
  permissions: AppPermission[];
};
