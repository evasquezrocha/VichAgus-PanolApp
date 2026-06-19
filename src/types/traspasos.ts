import type { Equipment } from "@/types/equipos";
import type { Tool } from "@/types/panol";

export type TransferEmployeeSummary = {
  id: string;
  nombres: string;
  apellidos: string | null;
  rut: string | null;
};

export type TransferLocationSummary = {
  id: string;
  nombre: string;
  is_default: boolean;
};

export type TransferUserSummary = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
};

export type TransferEndpointType = "employee" | "location";

export type TransferEquipmentRow = Equipment & {
  current_employee_id: string | null;
  current_employee_name: string | null;
};

export type TransferToolRow = Tool & {
  assigned_quantity: number;
  unassigned_quantity: number;
  allocations: Array<{
    employee_id: string | null;
    quantity: number;
  }>;
};

export type EmployeeTransferItem = {
  id: string;
  transfer_id: string;
  item_type: "equipment" | "tool";
  equipment_id: string | null;
  tool_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  equipment?: Equipment | null;
  tool?: Tool | null;
};

export type EmployeeTransfer = {
  id: string;
  company_id: string;
  origin_type: TransferEndpointType;
  origin_employee_id: string | null;
  origin_location_id: string | null;
  destination_type: TransferEndpointType;
  destination_employee_id: string | null;
  destination_location_id: string | null;
  created_by_user_id: string | null;
  signed_by_user_id: string | null;
  signature_data: string | null;
  transfer_date: string;
  transfer_time: string;
  created_at: string;
  updated_at: string;
  origin_employee?: TransferEmployeeSummary | null;
  origin_location?: TransferLocationSummary | null;
  destination_employee?: TransferEmployeeSummary | null;
  destination_location?: TransferLocationSummary | null;
  created_by_user?: TransferUserSummary | null;
  signed_by_user?: TransferUserSummary | null;
  items: EmployeeTransferItem[];
};
