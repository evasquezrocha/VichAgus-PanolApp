import type { EmployeeTransfer } from "@/types/traspasos";

export function getTransferDisplayNumber(transfer: Pick<EmployeeTransfer, "transfer_number" | "id">) {
  if (transfer.transfer_number > 0) {
    return `TR-${String(transfer.transfer_number).padStart(6, "0")}`;
  }

  return transfer.id;
}

export function getTransferTechnicalId(transfer: Pick<EmployeeTransfer, "id">) {
  return transfer.id;
}
