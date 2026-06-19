export type EmployeeCompany = {
  id: string;
  company_id: string;
  nombre: string;
  created_at: string;
  updated_at: string;
};

export type Employee = {
  id: string;
  company_id: string;
  employee_company_id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string | null;
  telefono: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
