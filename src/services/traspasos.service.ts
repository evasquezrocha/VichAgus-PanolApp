import "server-only";

import {
  getEmployeeTransferForCurrentCompanyAdmin,
  createEmployeeTransferForCurrentCompanyAdmin,
  listEmployeeTransfersForCurrentCompanyAdmin,
  listTransferEquipmentsForCurrentCompanyAdmin,
  listTransferToolsForCurrentCompanyAdmin,
} from "@/server/dal/traspasos.dal";

export async function listTransferEquipments() {
  return listTransferEquipmentsForCurrentCompanyAdmin();
}

export async function listTransferTools() {
  return listTransferToolsForCurrentCompanyAdmin();
}

export async function listEmployeeTransfers() {
  return listEmployeeTransfersForCurrentCompanyAdmin();
}

export async function getEmployeeTransfer(transferId: string) {
  return getEmployeeTransferForCurrentCompanyAdmin(transferId);
}

export type TransferEndpointInput =
  | { type: "employee"; employee_id: string; location_id?: never }
  | { type: "location"; location_id: string; employee_id?: never };

export async function createEmployeeTransfer(input: {
  origin: TransferEndpointInput;
  destination: TransferEndpointInput;
  transfer_date: string;
  transfer_time: string;
  signature_data: string;
  items: Array<
    | { item_type: "equipment"; equipment_id: string }
    | { item_type: "tool"; tool_id: string; quantity: number }
  >;
}) {
  return createEmployeeTransferForCurrentCompanyAdmin(input);
}
