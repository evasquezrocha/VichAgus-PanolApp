export type LocationUserSummary = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
};

export type PanolLocation = {
  id: string;
  company_id: string;
  nombre: string;
  responsible_user_id: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  responsible_user?: LocationUserSummary | null;
};

export type LocationAssignmentFields = {
  ubicacion_id: string;
  ubicacion_nombre?: string | null;
  ubicacion_display_name?: string | null;
  assigned_employee_id?: string | null;
  assigned_employee_name?: string | null;
};
