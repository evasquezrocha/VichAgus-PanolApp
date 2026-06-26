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

export type EmployeeEquipmentDetail = {
  id: string;
  equipment_id: string;
  codigo: string;
  descripcion: string;
  nro_serie: string | null;
  estado: string | null;
  marca: string | null;
  modelo: string | null;
  assigned_at: string;
  group_codigo: string | null;
  group_descripcion: string | null;
};

export type EmployeeToolDetail = {
  id: string;
  tool_id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  estado: string | null;
  marca: string | null;
  modelo: string | null;
  assigned_at: string;
};

export type EmployeeTransferHistoryEntry = {
  transfer_id: string;
  transfer_number: number;
  transfer_date: string;
  transfer_time: string;
  direction: "incoming" | "outgoing";
  counterpart_label: string;
  item_count: number;
  equipment_count: number;
  tool_quantity: number;
};

export type EmployeeDetail = {
  employee: Employee;
  company_name: string;
  employee_company_name: string;
  equipments: EmployeeEquipmentDetail[];
  tools: EmployeeToolDetail[];
  history: EmployeeTransferHistoryEntry[];
  equipment_count: number;
  tool_quantity: number;
};
