export type Company = {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  rut: string | null;
  logo_url: string | null;
  sidebar_bg_color: string;
  sidebar_text_color: string;
  sidebar_active_bg_color: string;
  sidebar_active_text_color: string;
  platform_background_color: string;
  popup_bg_color: string;
  popup_text_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
